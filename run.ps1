param (
  # Application
  [Parameter(Mandatory = $true, Position = 1)]
  [ValidateSet('peer-server', 'server', 'web')]
  [Alias('app')]
  [string]
  $Aplication
)

if ($Aplication -eq 'peer-server') {
  Set-Location './peer-server'

  & npm install

  & npm start

  return
}

if ($Aplication -eq 'server') {
  Set-Location './server'

  & npm install

  & npm start

  return
}

if ($Aplication -eq 'web') {
  Set-Location './public'

  & npm start

  return
}
