import os
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

DB_NAME = os.getenv("dbname")
DB_USER = os.getenv("user")
DB_PASSWORD = os.getenv("password")
DB_HOST = os.getenv("host")
DB_PORT = os.getenv("port")
DB_SSLMODE = os.getenv("DB_SSLMODE")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        sslmode=DB_SSLMODE
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def insert_dataframe(df, table, columns, pg_conflict_columns, supabase_conflict_columns=None):
    if supabase_conflict_columns is None:
        supabase_conflict_columns = pg_conflict_columns

    df = df.drop_duplicates(subset=pg_conflict_columns)
    tuples = [tuple(x) for x in df[columns].values]
    pg_query = f"INSERT INTO {table} ({','.join(columns)}) VALUES %s ON CONFLICT DO NOTHING"

    try:
        conn = get_connection()
        cur = conn.cursor()
        execute_values(cur, pg_query, tuples)
        conn.commit()
        print(f"✅ PostgreSQL: Inserted into {table}: {len(tuples)} rows")
        cur.close()
        conn.close()

        # Supabase insert
        try:
            records = [dict(zip(columns, row)) for row in tuples]
            for i in range(0, len(records), 1000):
                batch = records[i:i+1000]
                supabase.table(table).upsert(batch, on_conflict=','.join(supabase_conflict_columns)).execute()
                print(f"✅ Supabase: Inserted batch {i//1000 + 1} into {table}: {len(batch)} rows")
            return True
        except Exception as e:
            print(f"⚠️ Supabase insert warning for {table}: {e}")
            return e
    except Exception as e:
        print(f"❌ Failed to insert into {table}: {e}")
        return e
