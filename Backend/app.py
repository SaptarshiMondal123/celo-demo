from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import report_routes, proposal_routes, fund_routes

app = FastAPI(
    title="EchoDAO Backend",
    description="AI-powered and blockchain-integrated platform for transparent reporting.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(report_routes.router, prefix="/reports", tags=["Reports"])
app.include_router(proposal_routes.router, prefix="/proposals", tags=["Proposals"])
app.include_router(fund_routes.router, prefix="/funds", tags=["Funds"])

@app.get("/")
def root():
    return {"message": "Welcome to EchoDAO Backend 🚀"}
