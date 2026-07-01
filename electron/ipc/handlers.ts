import { ipcMain, BrowserWindow, dialog, shell } from 'electron'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  listObjects, getObject, createObject, updateObject,
  approveObject, listActivity, getAppState, getGraphSnapshot,
  getConfig, setConfig,
  createRelationship, listRelationships, deleteRelationship, countAllRelationships,
  createExportRecord, listExportRecords,
} from '../db/queries.js'
import { sendToAgent, initOpenAI } from '../agent/openai.js'
import { testConnection, performSync } from '../github/sync.js'

export function registerHandlers(win: BrowserWindow, apiKey: string, assistantId: string) {
  initOpenAI(apiKey, assistantId)

  ipcMain.handle('objects:list',   async (_e, { type, status } = {}) => listObjects(type, status))
  ipcMain.handle('objects:get',    async (_e, { id }) => getObject(id))

  ipcMain.handle('objects:create', async (_e, data) => {
    const obj = await createObject(data)
    const [latest] = await listActivity(1)
    win.webContents.send('activity:new', latest)
    win.webContents.send('state:refresh')
    return obj
  })

  ipcMain.handle('objects:update', async (_e, { id, ...changes }) => {
    const obj = await updateObject(id, changes)
    const [latest] = await listActivity(1)
    win.webContents.send('activity:new', latest)
    win.webContents.send('state:refresh')
    return obj
  })

  ipcMain.handle('objects:approve', async (_e, { id, note }) => {
    const obj = await approveObject(id, note)
    const [latest] = await listActivity(1)
    win.webContents.send('activity:new', latest)
    win.webContents.send('state:refresh')
    return obj
  })

  ipcMain.handle('objects:search', async (_e, { query }) => {
    const all = await listObjects()
    const q = query.toLowerCase()
    return all.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q) ||
      o.tags.some((t: string) => t.toLowerCase().includes(q))
    )
  })

  ipcMain.handle('activity:list', async (_e, { limit } = {}) => listActivity(limit))

  // Relationships
  ipcMain.handle('relationships:list',   async (_e, { objectId }) => listRelationships(objectId))
  ipcMain.handle('relationships:count',  async () => countAllRelationships())
  ipcMain.handle('relationships:create', async (_e, { sourceId, targetId, type }) => {
    const rel = await createRelationship(sourceId, targetId, type)
    win.webContents.send('state:refresh')
    return rel
  })
  ipcMain.handle('relationships:delete', async (_e, { id }) => {
    await deleteRelationship(id)
    win.webContents.send('state:refresh')
  })

  ipcMain.handle('agent:send', async (_e, { message, context }) => {
    try {
      const reply = await sendToAgent(message, context)
      const [latest] = await listActivity(1)
      win.webContents.send('activity:new', latest)
      win.webContents.send('state:refresh')
      return { success: true, message: reply }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('app:state',      async () => getAppState())
  ipcMain.handle('graph:snapshot', async () => getGraphSnapshot())

  ipcMain.handle('config:get', async (_e, { key }) => getConfig(key))
  ipcMain.handle('config:set', async (_e, { key, value }) => { await setConfig(key, value) })

  // GitHub
  // ── Attachments ─────────────────────────────────────────────────────────────
  ipcMain.handle('attachments:pick', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Select Attachments',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Documents',   extensions: ['doc','docx','pdf','md','epub','txt','rtf'] },
        { name: 'Images',      extensions: ['png','jpg','jpeg','gif','bmp','svg','webp'] },
        { name: 'Audio',       extensions: ['mp3','wav','ogg','m4a','flac','aac'] },
        { name: 'Video (<100 MB)', extensions: ['mp4','mov','avi','mkv','webm'] },
        { name: 'All Files',   extensions: ['*'] },
      ],
    })
    if (result.canceled || !result.filePaths.length) return []
    return result.filePaths.map(fp => {
      const stat = fs.statSync(fp)
      return {
        name: path.basename(fp),
        path: fp,
        size: stat.size,
        ext:  path.extname(fp).toLowerCase().slice(1),
      }
    })
  })

  ipcMain.handle('github:connect-test', async (_e, cfg) => testConnection(cfg))

  ipcMain.handle('github:sync', async (_e, cfg) => {
    const objects = await listObjects()
    const result = await performSync(cfg, objects)
    if (result.success && result.syncedAt) {
      await setConfig('github_last_sync', result.syncedAt)
    }
    return result
  })

  ipcMain.handle('github:last-sync', async () => getConfig('github_last_sync'))

  ipcMain.handle('github:config-get', async () => ({
    url:    await getConfig('github_url'),
    branch: await getConfig('github_branch'),
  }))

  ipcMain.handle('github:config-save', async (_e, { url, branch }) => {
    await setConfig('github_url', url)
    await setConfig('github_branch', branch)
    return { success: true }
  })

  // ── Export ──────────────────────────────────────────────────────────────────

  ipcMain.handle('export:save-pdf', async (_e, { html, defaultName, objectId, objectTitle, signedBy, signedTitle, signedAt }) => {
    const result = await dialog.showSaveDialog(win, {
      defaultPath: defaultName + '.pdf',
      filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
    })
    if (result.canceled || !result.filePath) return { saved: false }

    // Write HTML to temp file and render via hidden window
    const tmpHtml = path.join(os.tmpdir(), `divad-export-${Date.now()}.html`)
    fs.writeFileSync(tmpHtml, html, 'utf8')

    const hidden = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false, contextIsolation: true } })
    await hidden.loadFile(tmpHtml)
    const pdfBuffer = await hidden.webContents.printToPDF({ pageSize: 'A4', printBackground: true })
    hidden.close()
    fs.unlinkSync(tmpHtml)

    fs.writeFileSync(result.filePath, pdfBuffer)
    await createExportRecord({ object_id: objectId, object_title: objectTitle, format: 'PDF', file_path: result.filePath, signed_by: signedBy ?? null, signed_title: signedTitle ?? null, signed_at: signedAt ?? null })
    return { saved: true, filePath: result.filePath }
  })

  ipcMain.handle('export:save-docx', async (_e, { objectData, signatureData, defaultName, objectId, objectTitle }) => {
    const result = await dialog.showSaveDialog(win, {
      defaultPath: defaultName + '.docx',
      filters: [{ name: 'Word Document', extensions: ['docx'] }],
    })
    if (result.canceled || !result.filePath) return { saved: false }

    const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, Table, TableRow, TableCell, WidthType, AlignmentType, Header, Footer, PageNumber, NumberFormat } = await import('docx')

    const meta = objectData.metadata as Record<string, string>
    const contentParas: InstanceType<typeof Paragraph>[] = []

    if (objectData.description) {
      contentParas.push(new Paragraph({ text: 'Description', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }))
      contentParas.push(new Paragraph({ children: [new TextRun({ text: objectData.description, size: 22 })], spacing: { after: 200 } }))
    }

    const metaFields: [string, string][] = [
      ['Type', objectData.type.replace(/_/g, ' ')],
      ['Status', objectData.status.replace(/_/g, ' ')],
      ['Owner', objectData.owner ?? '—'],
      ['Priority', objectData.priority ?? '—'],
      ['Revision', `v${objectData.revision}`],
      ['Created', new Date(objectData.created_at).toLocaleDateString()],
      ['Updated', new Date(objectData.updated_at).toLocaleDateString()],
      ['Object ID', objectData.id],
    ]
    if (objectData.tags?.length) metaFields.push(['Tags', objectData.tags.join(', ')])

    // Extra metadata fields
    ;['ddrNumber','reviewDate','problem','decision','alternatives','consequences','content','domain','knowledgeType','confidence','mitigation','severity','likelihood'].forEach(k => {
      if (meta[k]) metaFields.push([k.replace(/([A-Z])/g, ' $1').trim(), meta[k]])
    })

    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: metaFields.map(([k, v]) => new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 18, color: '475569' })], alignment: AlignmentType.LEFT })], width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: 'F8FAFC' } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v, size: 18 })] })], width: { size: 70, type: WidthType.PERCENTAGE } }),
      ] })),
    })

    const sigParas: InstanceType<typeof Paragraph>[] = []
    if (signatureData?.include) {
      sigParas.push(
        new Paragraph({ text: '', spacing: { before: 480 } }),
        new Paragraph({ children: [new TextRun({ text: 'Digitally Signed By', bold: true, size: 20, color: '1a3057' })], spacing: { before: 200 } }),
        new Paragraph({ children: [new TextRun({ text: signatureData.name, size: 22, bold: true })], spacing: { before: 80 } }),
        new Paragraph({ children: [new TextRun({ text: signatureData.title, size: 20, color: '475569' })], spacing: { before: 40 } }),
        new Paragraph({ children: [new TextRun({ text: `Date: ${signatureData.date}`, size: 20, color: '475569' })], spacing: { before: 40 } }),
      )
    }

    const doc = new Document({
      creator: 'Divad OS',
      title: objectData.title,
      description: objectData.description ?? '',
      sections: [{
        headers: {
          default: new Header({ children: [new Paragraph({ children: [new TextRun({ text: 'DIVAD OS — Engineering Knowledge Engine', size: 16, color: '94a3b8', allCaps: true })] })] }),
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ children: [new TextRun({ text: `${objectData.type.toUpperCase()} | ${objectData.id.slice(0,8)} | Generated ${new Date().toLocaleString()}  `, size: 16, color: '94a3b8' }), new TextRun({ children: [PageNumber.CURRENT] })] })] }),
        },
        children: [
          new Paragraph({ children: [new TextRun({ text: 'DIVAD OS', size: 18, allCaps: true, color: '94a3b8', characterSpacing: 200 })], spacing: { after: 80 } }),
          new Paragraph({ text: objectData.title, heading: HeadingLevel.HEADING_1, spacing: { after: 160 } }),
          metaTable,
          ...contentParas,
          ...sigParas,
        ],
      }],
    })

    const docxBuffer = await Packer.toBuffer(doc)
    fs.writeFileSync(result.filePath, docxBuffer)
    await createExportRecord({ object_id: objectId, object_title: objectTitle, format: 'DOCX', file_path: result.filePath, signed_by: signatureData?.include ? signatureData.name : null, signed_title: signatureData?.include ? signatureData.title : null, signed_at: signatureData?.include ? signatureData.date : null })
    return { saved: true, filePath: result.filePath }
  })

  ipcMain.handle('export:print', async (_e, { html }) => {
    const tmpHtml = path.join(os.tmpdir(), `divad-print-${Date.now()}.html`)
    fs.writeFileSync(tmpHtml, html, 'utf8')
    const hidden = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false, contextIsolation: true } })
    await hidden.loadFile(tmpHtml)
    hidden.webContents.print({ silent: false, printBackground: true })
    setTimeout(() => { hidden.close(); fs.unlinkSync(tmpHtml) }, 10000)
    return { success: true }
  })

  ipcMain.handle('export:send', async (_e, { subject, body, filePath }) => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    await shell.openExternal(mailtoUrl)
    if (filePath) await shell.showItemInFolder(filePath)
    return { success: true }
  })

  ipcMain.handle('export:history', async (_e, { objectId }) => listExportRecords(objectId))
}
