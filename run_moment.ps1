# MOMENT - AI Pregnancy Companion Startup Script
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host "  MOMENT — Evidence-Grounded AI Pregnancy Companion" -ForegroundColor Cyan
Write-Host "  Longitudinal Memory • RAG Clinical Evidence • Safety Triage" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Magenta

# Start FastAPI Backend
Write-Host "Starting Python FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
$backendProcess = Start-Process python -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory "c:\Users\patha\OneDrive\Desktop\MOMent\backend" -PassThru

# Start Vite Frontend
Write-Host "Starting Vite React Frontend on http://localhost:5173 ..." -ForegroundColor Green
Set-Location -Path "c:\Users\patha\OneDrive\Desktop\MOMent\frontend"
npm run dev
