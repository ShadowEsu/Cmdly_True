package com.aicommandvault.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.aicommandvault.app.data.SettingsStore
import com.aicommandvault.app.data.VaultAccent
import com.aicommandvault.app.data.VaultFontScale

@Composable
fun SettingsScreen(
    settings: SettingsStore,
    onSettingsChanged: () -> Unit,
) {
    Column(
        Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Spacer(Modifier.height(8.dp))
        Text("Settings", style = MaterialTheme.typography.headlineLarge)
        Text("Display and feedback (local).", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)

        Text("Font size", style = MaterialTheme.typography.titleMedium)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            VaultFontScale.entries.forEach { scale ->
                FilterChip(
                    selected = settings.fontScale() == scale,
                    onClick = {
                        settings.setFontScale(scale)
                        onSettingsChanged()
                    },
                    label = { Text(scale.name) },
                )
            }
        }

        Text("Accent (UI polish)", style = MaterialTheme.typography.titleMedium)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            VaultAccent.entries.forEach { a ->
                FilterChip(
                    selected = settings.accent() == a,
                    onClick = {
                        settings.setAccent(a)
                        onSettingsChanged()
                    },
                    label = { Text(a.name) },
                )
            }
        }

        Row(
            Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(Modifier.weight(1f)) {
                Text("Haptics on copy", style = MaterialTheme.typography.titleMedium)
                Text("Uses CONFIRM haptic where supported.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Switch(
                checked = settings.hapticsEnabled(),
                onCheckedChange = {
                    settings.setHaptics(it)
                    onSettingsChanged()
                },
            )
        }

        Spacer(Modifier.height(12.dp))
        Text("About", style = MaterialTheme.typography.titleMedium)
        Text("Cmdly · 0.1.0", style = MaterialTheme.typography.bodyMedium)
        Text("MIT License · cmdly.app/privacy", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)

        Spacer(Modifier.height(8.dp))
        Text(
            "Cmdly is an independent reference tool. It is not affiliated with, endorsed by, or sponsored by Anthropic, OpenAI, Google, GitHub, Perplexity, Mistral, DeepSeek, xAI, Lovable, or any other platform listed in the app.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Text(
            "Reference data is illustrative — always confirm shortcuts against each vendor's current documentation.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 8.dp),
        )
    }
}
