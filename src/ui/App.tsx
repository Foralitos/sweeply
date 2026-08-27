import React, { useEffect, useMemo, useState } from 'react'
import { Box, Text, useApp, useInput, useStdout } from 'ink'
import path from 'node:path'
import os from 'node:os'
import { scan, type FoundProject } from '../core/scanner.js'
import type { TargetDef } from '../core/targets.js'
import { dirSize, formatSize } from '../core/size.js'
import { gitStatus, type GitStatus } from '../core/git.js'
import { removeTargets } from '../core/remove.js'
import { checkForUpdate, type UpdateInfo } from '../core/update.js'
import { t } from '../core/i18n.js'
import { ProjectRow } from './ProjectRow.js'
import { Footer } from './Footer.js'

export interface Row {
  project: FoundProject
  size?: number
  git?: GitStatus
  selected: boolean
  deleted: boolean
}

type Mode = 'list' | 'confirm' | 'deleting'

export function App({ rootDir, targets }: { rootDir: string; targets: TargetDef[] }) {
  const { exit } = useApp()
  const { stdout } = useStdout()
  const [rows, setRows] = useState<Row[]>([])
  const [scanning, setScanning] = useState(true)
  const [cursor, setCursor] = useState(0)
  const [mode, setMode] = useState<Mode>('list')
  const [showDetail, setShowDetail] = useState(false)
  const [sortBySize, setSortBySize] = useState(false)
  const [freedSize, setFreedSize] = useState(0)
  const [deleteProgress, setDeleteProgress] = useState('')
  const [update, setUpdate] = useState<UpdateInfo | null>(null)

  // chequeo de versión: sin await en el arranque, si falla no se muestra nada
  useEffect(() => {
    let cancelled = false
    void checkForUpdate().then((info) => {
      if (!cancelled && info) setUpdate(info)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const patchRow = (projectPath: string, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((r) => (r.project.path === projectPath ? { ...r, ...patch } : r)),
    )
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      for await (const project of scan(rootDir, targets)) {
        if (cancelled) return
        setRows((prev) => [...prev, { project, selected: false, deleted: false }])
        // tamaño y git en paralelo, sin bloquear el escaneo
        void Promise.all(project.targets.map((t) => dirSize(t.path))).then((sizes) => {
          if (!cancelled) patchRow(project.path, { size: sizes.reduce((a, b) => a + b, 0) })
        })
        void gitStatus(project.path).then((git) => {
          if (!cancelled) patchRow(project.path, { git })
        })
      }
      if (!cancelled) setScanning(false)
    })()
    return () => {
      cancelled = true
    }
  }, [rootDir, targets])

  const visible = useMemo(() => {
    const list = [...rows]
    if (sortBySize) list.sort((a, b) => (b.size ?? -1) - (a.size ?? -1))
    return list
  }, [rows, sortBySize])

  const current = visible[cursor]
  const selected = rows.filter((r) => r.selected && !r.deleted)
  const selectedSize = selected.reduce((a, r) => a + (r.size ?? 0), 0)

  const doDelete = async () => {
    setMode('deleting')
    const toDelete = rows.filter((r) => r.selected && !r.deleted)
    for (const row of toDelete) {
      const { failed } = await removeTargets(row.project.targets, (done, total) => {
        setDeleteProgress(`${row.project.name}: ${done}/${total}`)
      })
      if (failed.length === 0) {
        setFreedSize((f) => f + (row.size ?? 0))
        patchRow(row.project.path, { deleted: true, selected: false })
      } else {
        setDeleteProgress(t().errorIn(row.project.name, String(failed[0]!.error)))
      }
    }
    setDeleteProgress('')
    setMode('list')
  }

  useInput((input, key) => {
    if (mode === 'deleting') return
    if (mode === 'confirm') {
      if (input === 'y' || input === 's') void doDelete()
      else if (input === 'n' || key.escape) setMode('list')
      return
    }
    if (input === 'q' || (key.ctrl && input === 'c')) exit()
    else if (key.downArrow || input === 'j') setCursor((c) => Math.min(c + 1, visible.length - 1))
    else if (key.upArrow || input === 'k') setCursor((c) => Math.max(c - 1, 0))
    else if (input === ' ' && current && !current.deleted) {
      patchRow(current.project.path, { selected: !current.selected })
    } else if (input === 'a') {
      setRows((prev) =>
        prev.map((r) =>
          r.git?.semaphore === 'green' && !r.deleted ? { ...r, selected: true } : r,
        ),
      )
    } else if (input === 'g') setShowDetail((d) => !d)
    else if (input === 's') setSortBySize((s) => !s)
    else if (key.return && selected.length > 0) setMode('confirm')
  })

  // ventana de scroll según altura de terminal
  const listHeight = Math.max(5, (stdout?.rows ?? 24) - 8)
  // -1 para no tocar la última columna: si el renglón llena el ancho exacto,
  // algunas terminales meten un salto de línea extra y se rompe la lista
  const rowWidth = Math.max(20, (stdout?.columns ?? 80) - 1)
  const offset = Math.max(0, Math.min(cursor - Math.floor(listHeight / 2), visible.length - listHeight))
  const windowRows = visible.slice(offset, offset + listHeight)

  const totalFound = rows.reduce((a, r) => a + (r.size ?? 0), 0)
  const displayDir = path.resolve(rootDir).replace(os.homedir(), '~')
  const msg = t()

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">sweeply</Text>
        <Text wrap="truncate">
          <Text color="gray"> · {displayDir}</Text>
          <Text> · {scanning ? msg.scanning : msg.projects(rows.length)}</Text>
          <Text color="magenta"> · {formatSize(totalFound)} {msg.reclaimable}</Text>
        </Text>
      </Box>

      {rows.length === 0 && !scanning && (
        <Text color="gray">{msg.nothingToClean(rootDir)}</Text>
      )}

      {windowRows.map((row, i) => (
        <ProjectRow
          key={row.project.path}
          row={row}
          isCursor={offset + i === cursor}
          width={rowWidth}
        />
      ))}

      {showDetail && current?.git && (
        <Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1} marginTop={1}>
          <Text bold>{current.project.path}</Text>
          {current.git.detail.split('\n').map((line, i) => (
            <Text key={i} color="gray">{line}</Text>
          ))}
        </Box>
      )}

      {mode === 'confirm' && (
        <Box flexDirection="column" borderStyle="double" borderColor="red" paddingX={1} marginTop={1}>
          <Text bold color="red">{msg.confirmTitle(selected.length, formatSize(selectedSize))}</Text>
          {selected.slice(0, 6).map((r) => (
            <Text key={r.project.path}>
              {'  '}{r.project.name}: {r.project.targets.map((t) => t.name).join(', ')}
            </Text>
          ))}
          {selected.length > 6 && <Text color="gray">{msg.andMore(selected.length - 6)}</Text>}
          <Text color="gray">{msg.onlyRegenerable}</Text>
          <Text bold>{msg.confirmKeys}</Text>
        </Box>
      )}

      {mode === 'deleting' && (
        <Box marginTop={1}>
          <Text color="yellow">{msg.deleting} {deleteProgress}</Text>
        </Box>
      )}

      {update && (
        <Box marginTop={1}>
          <Text color="yellow">
            {msg.updateAvailable(update.current, update.latest)}
            <Text bold>{update.command}</Text>
          </Text>
        </Box>
      )}

      <Footer
        selectedCount={selected.length}
        selectedSize={selectedSize}
        freedSize={freedSize}
        sortBySize={sortBySize}
      />
    </Box>
  )
}
