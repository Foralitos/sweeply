import React from 'react'
import { Box, Text } from 'ink'
import { formatSize } from '../core/size.js'
import { t } from '../core/i18n.js'

export function Footer({
  selectedCount,
  selectedSize,
  freedSize,
  sortBySize,
}: {
  selectedCount: number
  selectedSize: number
  freedSize: number
  sortBySize: boolean
}) {
  const msg = t()
  return (
    <Box flexDirection="column" marginTop={1}>
      {freedSize > 0 && <Text color="green">{msg.freedThisSession(formatSize(freedSize))}</Text>}
      <Text color="gray">
        {msg.keysMain}
        {selectedCount > 0 && (
          <Text color="red" bold>
            {' '}
            {msg.marked(selectedCount, formatSize(selectedSize))}
          </Text>
        )}
        {msg.keysTail}
        {sortBySize ? msg.sortSuffix : ''}
        {msg.keysQuit}
      </Text>
    </Box>
  )
}
