# Worker (D1 + Nominatim proxy)

## 로컬 실행
```bash
npm run dev:worker
```

## D1 생성/스키마 적용
```bash
npx wrangler login
npx wrangler d1 create couplemap_db
# wrangler.toml의 database_id 채우기
npx wrangler d1 execute couplemap_db --file schema.sql --config wrangler.toml
```
