from flask import Flask, jsonify

app = Flask(__name__)


@app.route('/')
def index():
    return jsonify({'message': 'Jarvis Flask API', 'status': 'ok'})


@app.route('/health')
def health():
    import os
    return jsonify({'status': 'ok', 'pid': os.getpid()})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
