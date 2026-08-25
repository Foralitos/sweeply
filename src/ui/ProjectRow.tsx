import React from 'react'
import { Box, Text } from 'ink'
import type { Row } from './App.js'
import { formatSize } from '../core/size.js'

const SEM_COLOR = { green: 'green', yellow: 'yellow', red: 'red' } as const

export function ProjectRow({ row, isCursor }: { row: Row; isCursor: boolean }) {
  const targets = row.project.targets.map((t) => t.name).join(' + ')
  const sem = row.git ? SEM_COLOR[row.git.semaphore] : 'gray'
  return (
    <Box>
      <Text color={isCursor ? 'cyan' : undefined}>{isCursor ? '❯ ' : '  '}</Text>
      <Text color={row.deleted ? 'gray' : isCursor ? 'cyan' : undefined}>
        {row.deleted ? '✔ ' : row.selected ? '■ ' : '□ '}
      </Text>
      <Box width={24}>
        <Text bold={isCursor} strikethrough={row.deleted} wrap="truncate">
          {row.project.name}
        </Text>
      </Box>
      <Box width={9} justifyContent="flex-end" marginRight={2}>
        <Text color={row.deleted ? 'gray' : 'magenta'}>
          {row.deleted ? 'liberado' : formatSize(row.size)}
        </Text>
      </Box>
      <Box width={16}>
        <Text color={sem}>
          {'● '}
          {row.git ? row.git.summary : '…'}
        </Text>
      </Box>
      <Box width={12}>
        <Text color="gray">{row.git?.lastActivity ?? ''}</Text>
      </Box>
      <Text color="gray" wrap="truncate">
        {targets}
      </Text>
    </Box>
  )
}
