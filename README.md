# Arawe

![rec](rec.mp4)

## Message types

### Server to Client

- `p:n(int)` - new player
- `p:n(int):hp` - player hp
- `p:n(int):set:id(int)` - player set item
- `p:n(int):pos:x(int),y(int)` - player changed position
- `p:n(int):use:dx(float)[-1;1],dy(float)[-1;1]` - player used item
- `p:n(int):vec:dx(float)[-1;1],dy(float)[-1;1]` - player changed vector

### Client to Server

- `set:id(int)` - set item
- `use:dx(float)[-1;1],dy(float)[-1;1]` - use item
- `vec:dx(float)[-1;1],dy(float)[-1;1]` - change vector

## Setup

```python -m venv .venv
pip install -r requirements.txt
python -m server
```

