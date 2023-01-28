### Login admin

`POST  http://localhost:7747/admin/login`
`Content-Type: application/json`

```json
{
  "email": "khalifan@mk.com",
  "password": "1234567"
}
```

### register admin

`POST  http://localhost:7747/admin/register-a`
`Content-Type: application/json`

```json
{
  "name": "khalifan",
  "email": "khalifan@mk.com",
  "contact": "0706081432",
  "password": "1234567"
}
```

### Creating cards

`POST  http://localhost:7747/cards/print-newcards`
`Content-Type: application/json`

```json
{
  "generatorID": "63951402f06f6e1f94df0dc0",
  "count": 11,
  "amount": "5000"
}
```

### unavailable specific card counts

`POST  http://localhost:7747/cards/unavailable`
`Content-Type: application/json`

```json
{
  "cardAmount": "10000"
}
```

### available specific card counts

`POST  http://localhost:7747/cards/available`
`Content-Type: application/json`

```json
{
  "cardAmount": "10000"
}
```

### all available card counts

`POST  http://localhost:7747/cards/available`
`Content-Type: application/json`

```json
{
  "cardAmount": ""
}
```

### all unavailable card counts

`POST  http://localhost:7747/cards/unavailable`
`Content-Type: application/json`

```json
{
  "cardAmount": ""
}
```

### add farmer

`POST  http://localhost:7747/farmer/add-farmer`
`Content-Type: application/json`

```json
{
  "name": "Taka Lodi",
  "contact": "0780543243",
  "adderID": "63951402f06f6e1f94df0dc0",
  "farmProducts": ["maize", "cows"],
  "gender": "male",
  "location": "indiana polis"
}
```

### get single farmer

`GET   http://localhost:7747/farmer/639db80e8da6e53a40673612`
`Content-Type: application/json`

### get all farmers

`GET   http://localhost:7747/farmer/`
`Content-Type: application/json`

### add products

`POST  http://localhost:7747/products/add-product`
`Content-Type: application/json`

```json
{
  "name": "spade",
  "price": "90000",
  "adderID": "63951402f06f6e1f94df0dc0",
  "description": "tools"
}
```

### get all products

`GET  http://localhost:7747/products/`
`Content-Type: application/json`

### get single product

`GET  http://localhost:7747/products/639dc69f9684ee16c401187c`
`Content-Type: application/json`

### get all packages

`GET   http://localhost:7747/packages/`
`Content-Type: application/json`

### get all packages

`GET  http://localhost:7747/packages/`
`Content-Type: application/json`

### get single package

`GET  http://localhost:7747/packages/639de1fe1b52d32434369c5b`
`Content-Type: application/json`

### add a package

`POST  http://localhost:7747/packages/add-package`
`Content-Type: application/json`

```json
{
  "name": "tools and seed",
  "owner": "639dda958eb3b5360009895f",
  "adderID": "63951402f06f6e1f94df0dc0",
  "products": [
    {
      "productID": "639dc67a9684ee16c401187a",
      "name": "peas seeds",
      "price": "7000"
    },
    {
      "productID": "639dc69f9684ee16c401187c",
      "name": "spade",
      "price": "90000"
    }
  ],
  "totalAmount": 97000
}
```

### delete farmer`

`DELETE  http://localhost:7747/farmer/63d3fc52fec5c424487424ac`
`Content-Type: application/json`

### delete package

`DELETE  http://localhost:7747/packages/63d3fc52fec5c4244874e4ac`
`Content-Type: application/json`

### delete products

`DELETE  http://localhost:7747/products/63d3fc52fec5c4244874e4ac`
`Content-Type: application/json`

### get admin

`GET  http://localhost:7747/admin/63951402f06f6e1f94df0dc0`
`Content-Type: application/json`
