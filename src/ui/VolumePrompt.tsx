import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import type { VolumeCandidate } from '../core/volumes.js'
import { t } from '../core/i18n.js'

/**
 * Pantalla de permiso previa al escaneo en modo --all: lista los volúmenes
 * externos encontrados en /Volumes y deja elegir cuáles sumar como raíces
 * de escaneo. Ninguno viene marcado por default (opt-in explícito).
 */
export function VolumePrompt({
  volumes,
  onConfirm,
}: {
  volumes: VolumeCandidate[]
  onConfirm: (approved: VolumeCandidate[]) => void
}) {
  const [cursor, setCursor] = useState(0)
  const [checked, setChecked] = useState<boolean[]>(() => volumes.map(() => false))
  const msg = t()

  useInput((input, key) => {
    if (key.downArrow || input === 'j') setCursor((c) => Math.min(c + 1, volumes.length - 1))
    else if (key.upArrow || input === 'k') setCursor((c) => Math.max(c - 1, 0))
    else if (input === ' ') {
      setChecked((prev) => prev.map((v, i) => (i === cursor ? !v : v)))
    } else if (key.return) {
      onConfirm(volumes.filter((_, i) => checked[i]))
    } else if (key.escape) {
      onConfirm([]) // salir sin incluir ningún volumen
    }
  })

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">sweeply</Text>
        <Text color="gray"> · {msg.volumesTitle}</Text>
      </Box>

      <Text color="gray">{msg.volumesHint}</Text>

      <Box flexDirection="column" marginTop={1}>
        {volumes.map((v, i) => (
          <Text key={v.path} color={i === cursor ? 'cyan' : undefined} bold={i === cursor}>
            {i === cursor ? '▌ ' : '  '}
            {checked[i] ? '☑' : '☐'} {v.name}
          </Text>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text color="gray">{msg.volumesKeys}</Text>
      </Box>
    </Box>
  )
}
