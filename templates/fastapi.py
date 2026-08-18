from fastapi import FastAPI

app = FastAPI(title='Jarvis FastAPI')


@app.get('/')
def index():
    return {'message': 'Jarvis FastAPI', 'status': 'ok'}


@app.get('/health')
def health():
    return {'status': 'ok'}
