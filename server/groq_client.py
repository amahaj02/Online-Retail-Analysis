import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_sql_from_prompt(user_prompt: str) -> str:
    prompt = f"""
You are a helpful assistant that converts natural language questions into SQL queries.
The database contains the following tables:

customers(customer_id, country)
products(product_id, description, unit_price)
invoices(invoice_id, invoice_date)
invoice_items(invoice_id, product_id, customer_id, quantity)

Return only the SQL query. Do NOT explain anything. The question is:

{user_prompt}
    """

    chat_completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are a SQL generator."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    return chat_completion.choices[0].message.content.strip()
