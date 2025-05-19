from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from groq_client import get_sql_from_prompt
from db import get_connection

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your Vite dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/query")
async def query_handler(request: Request):
    data = await request.json()
    prompt = data.get("query", "")

    print("📝 Received query:", prompt)

    if not prompt:
        return {"error": "Empty query"}

    try:
        sql = get_sql_from_prompt(prompt)
        print("🔧 Generated SQL:", sql)

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql)
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]

        cur.close()
        conn.close()

        return {
            "sql": sql,
            "columns": columns,
            "rows": rows
        }
    except Exception as e:
        return {"error": str(e)}
