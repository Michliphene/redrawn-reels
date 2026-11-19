# Stores the ElevenLabs API key in the user environment (HKCU), typed hidden. The key is never printed.
$s = Read-Host "Colle ta cle ElevenLabs puis Entree" -AsSecureString
$b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
try { $k = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b).Trim() } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }
if (-not $k) { Write-Host "Rien de saisi, rien enregistre."; exit 1 }
[Environment]::SetEnvironmentVariable('ELEVENLABS_API_KEY', $k, 'User')
Write-Host "OK : cle enregistree ($($k.Length) caracteres). Tu peux le dire a Claude."
