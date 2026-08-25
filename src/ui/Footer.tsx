import React from 'react'
import { Box, Text } from 'ink'
import { formatSize } from '../core/size.js'

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
  return (
    <Box flexDirection="column" marginTop={1}>
      {freedSize > 0 && (
        <Text color="green">✔ liberado en esta sesión: {formatSize(freedSize)}</Text>
      )}
      <Text color="gray">
        {'↑↓ navegar · espacio seleccionar · a seleccionar 🟢 · enter borrar'}
        {selectedCount > 0 && (
          <Text color="white"> ({selectedCount} = {formatSize(selectedSize)})</Text>
        )}
        {' · g detalle git · s orden'}
        {sortBySize ? ' (tamaño)' : ''}
        {' · q salir'}
      </Text>
    </Box>
  )
}
