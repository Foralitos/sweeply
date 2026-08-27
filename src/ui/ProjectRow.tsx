import React from 'react'
import { Box, Text } from 'ink'
import type { Row } from './App.js'
import { formatSize } from '../core/size.js'
import { t } from '../core/i18n.js'

const SEM_COLOR = { green: 'green', yellow: 'yellow', red: 'red' } as const

// fondo del renglón bajo el cursor: 'blackBright' respeta la paleta de la terminal
// (cada tema define su propio gris) en vez de hardcodear un hex que rompe temas claros.
const CURSOR_BG = 'blackBright'

export function ProjectRow({
  row,
  isCursor,
  width,
}: {
  row: Row
  isCursor: boolean
  width: number
}) {
  const targets = row.project.targets.map((t) => t.name).join(' + ')
  const bg = isCursor ? CURSOR_BG : undefined
  // el gris se pierde sobre el fondo del cursor, así que ahí sube a blanco
  const dim = isCursor ? 'white' : 'gray'
  const marked = row.selected && !row.deleted
  // rojo = esto se va a borrar. brillante bajo el cursor para no perderse en el fondo.
  const danger = isCursor ? 'redBright' : 'red'
  const sem = row.git ? SEM_COLOR[row.git.semaphore] : dim

  // color base de la fila: rojo si está marcada para borrar
  const nameColor = row.deleted ? dim : marked ? danger : undefined
  const sizeColor = row.deleted ? dim : marked ? danger : 'magenta'
  const tailColor = marked ? danger : dim

  return (
    <Box width={width} backgroundColor={bg} overflow="hidden">
      <Text color={marked ? danger : 'cyan'} backgroundColor={bg} bold={marked}>
        {isCursor ? '▌' : marked ? '┃' : ' '}
      </Text>
      <Text backgroundColor={bg} color={row.deleted ? dim : marked ? danger : undefined} bold={marked}>
        {row.deleted ? ' ✔ ' : marked ? ' ✗ ' : ' □ '}
      </Text>
      <Box width={24}>
        <Text
          backgroundColor={bg}
          color={nameColor}
          bold={isCursor || marked}
          strikethrough={row.deleted}
          wrap="truncate"
        >
          {row.project.name}
        </Text>
      </Box>
      <Box width={9} justifyContent="flex-end" marginRight={2}>
        <Text backgroundColor={bg} color={sizeColor} bold={marked}>
          {row.deleted ? t().freedCell : formatSize(row.size)}
        </Text>
      </Box>
      <Box width={16}>
        {/* el semáforo git conserva su color aunque la fila esté marcada:
            es justo la info que quieres ver antes de confirmar el borrado */}
        <Text backgroundColor={bg} color={sem} bold={marked}>
          {'● '}
          {row.git ? row.git.summary : '…'}
        </Text>
      </Box>
      <Box width={12}>
        <Text backgroundColor={bg} color={tailColor}>
          {row.git?.lastActivity ?? ''}
        </Text>
      </Box>
      <Box flexGrow={1} minWidth={0}>
        <Text backgroundColor={bg} color={tailColor} wrap="truncate">
          {targets}
        </Text>
      </Box>
    </Box>
  )
}
