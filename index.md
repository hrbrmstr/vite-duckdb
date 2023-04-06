---
{
  "title": "🧪 Vite + 🦆 DuckDB via Observable's Standard Library",
  "description": "Not really a WebR Experiment, but we won't be using databases in WebR so we'll need other ways to get data from them",
  "og" : {
    "site_name": "WebR Exeriments",
    "url": "https://rud.is/w/vite-duckdb",
    "description": "Not really a WebR Experiment, but we won't be using databases in WebR so we'll need other ways to get data from them",
    "image": {
      "url": "https://rud.is/w/vite-duckdb/preview.png",
      "height": "1170",
      "width": "1932",
      "alt": "example"
    }
  },
  "twitter": {
    "site": "@hrbrmstr",
    "domain": "rud.is"
  },
	"extra_header_bits": [
		"<link rel='apple-touch-icon' sizes='180x180' href='./favicon/apple-touch-icon.png'/>",
		"<link rel='icon' type='image/png' sizes='32x32' href='./favicon/favicon-32x32.png'/>",
		"<link rel='icon' type='image/png' sizes='16x16' href='./favicon/favicon-16x16.png'/>",
		"<link rel='manifest' href='./favicon/site.webmanifest'/>",
		"<link href='./src/index.css' rel='stylesheet'/>",
		"<link href='./src/components.css' rel='stylesheet'/>",
		"<script type='module' src='./src/main.js'></script>"
	],
	"extra_body_bits": [
		"<!-- extra body bits -->"
	]
}
---
# 🧪 Vite + 🦆 DuckDB via Observable's Standard Library

<status-message id="webr-status" text="WebR Loading…"></status-message>

## Not really a WebR Experiment, but we won't be using databases in WebR so we'll need other ways to get data from them
----------
"Experiment" Design:

>Use `DuckDBClient` from Observable's [stdlib](https://github.com/observablehq/stdlib/) to perform database ops we will not be able to do from WebR for _a while_.

"Experiment" parameters:

- Webr _(just to prove it can coexist)_
- <span class="pill">New!</span> Observable Standard Library's `DuckDBCLient`
- Lit (web components)
- Vite (for building)
----------

## What The 🦆 DuckDB Is Happening Here, hrbrmstr?

Networking support in browser WASM world is _not great_. Browsers are choice targets for attackers, and giving them any more raw networking power than basic web (and a few other things which are not important right now) machinations is just asking for trouble. Suffice it to say you won't be connecting to Postgres or other "proper" databases from WebR (unless you're using some REST API interface), and — based on the Empscripten filesystem benchmarking you saw in a previous experiment, shoving copies of SQLite (if the R package for that ever works in WebR) databases into WebR's virtual filesystem doesn't make a whole lotta sense (to me).

But this is **R**; and, that means we want to do stuff with data!

What's a WebR data scientist gonna do?

Well, today we're going to look at using one type of database in javascript that will let us use familiar SQL to do data ops that (in some future experiment) we'll pass on to a WebR context and do useful stuffs with.

Said database is [DuckDB](duckdb.org), and if you have not heard of it before, this is totally not the place you should be hanging in today. There's a great WASM port of DuckDB and Observable has a [lovely wrapper for it](https://observablehq.com/@observablehq/duckdb) that they added to their open source standard library. Better still, we can work with it in Vanilla JS! And, not alot of Vanilla JS, meaning you can quickly get to focusing on SQL ops, which you are likely more familiar with than JS ops.

## Getting Access To DuckDB

The included `duckdb.js` is pretty tiny. For now we'll focus on the first couple lines (ignore the `FileAttachments` bit for now):

```js
import { Library, FileAttachments } from 'https://cdn.jsdelivr.net/npm/@observablehq/stdlib@5.5.1/+esm'

export const { DuckDBClient } = new Library()
```

This loads the Observable standard library from the CDN and exposes `DuckDBClient` so we can use it elsewhere, like `main.js`, where we (again, ignore `FileAttachment` and also `ddbResToArray` for now):

```js
import { DuckDBClient, ddbResToArray, FileAttachment } from "./duckdb.js";
```

We're only using the Observable standard library and not the whole runtime, which means that we have the following "database" table options:

* An Arrow file
* A Parquet file
* An Arrow table
* An array of objects (which can be loaded from any JSON/CSV/TSV/etc. or created in JS)

[Work is being done rn](https://github.com/duckdb/duckdb-wasm/issues/1202) to support using the [httpfs](https://duckdb.org/docs/extensions/httpfs) extension to DuckDB, which means we aren't going to be limited to whole in-memory database operations at some point. tbh That is pretty exciting! If you're not familiar with [HTTP Range Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests), you should poke a bit at that MDN doc. Those range requests let us ask the HTTP server for "n" bytes starting at some offset, and lots of file types, including Parquet, can be optimized to support said requests, meaning a smart client can iterate through a remote data source vs load it all up into memory.

## Growing Attached To `FileAttachment`s

As noted, we're not using the whole Observable runtime, but the standard library includes [`FileAttachment`](https://github.com/observablehq/stdlib/blob/main/src/fileAttachment.js), which is a nice wrapper around many [file type readers](https://github.com/observablehq/stdlib/blob/main/src/fileAttachment.js). They work a bit "differently" in Observable notebooks, but they work fine outside it, too, and I like having one interface to work with.

Here's a toy example:

```js
await FileAttachment("https://rud.is/remote-ip").text()
```

Which has the following output:

<simple-message id="bare-fa"></simple-message>

We'll use this in the next section to make a full on database.

## Making A Database With `DuckDBClient` from the Observable Standard Library

Let's bring in some data for our "database":

```js
// FileAttachment does not seem to grok relative bare path "URLs" so
// we help it out using the URL the user used to get here
const mtcars = await FileAttachment(`${window.location.href}/mtcars.csv`).csv({ typed: true })

// some external data just to show "fancy" SQL
const kev = await FileAttachment("https://rud.is/data/kev.json").json()
const tags = await FileAttachment("https://rud.is/data/tags.json").json()
```

Now, let's make a "database" from those "tables". We'll also create a table on the fly from a JS array of named objects:

```js
const db = await DuckDBClient().of({
  arr: [ { wat: "this is an array" }, { wat: "we will turn" }, { wat: "into a database table!" } ],
  mtcars: mtcars,
  kev: kev.vulnerabilities.map(d => {
    d.dateAdded = new Date(d.dateAdded)
    d.dueDate = new Date(d.dueDate)
    return d
  }),
  tags: tags.metadata.map(d => { // DuckDB does not like the JS `cves` "array" field
    d.cves = d.cves.join(';')         // so we compendate with a bit of wrangling
    return d
  })
})```

We'll make sure they're in `db`:

```js
await db.describeTables()
```

<simple-message id="describe-tables"></simple-message>

We'll also make sure it knows the types:

```js
await db.describeColumns({ table: "kev" })
```

<data-frame-view label = "'kev' table schema" id="kev-schema"></data-frame-view>

The `ddbResToArray()` function you saw earlier takes the query results from DuckDB — which are Arrow "Proxy" objects — and converts it to a more usable JS array. Let's use it, plus some SQL and JS wrangling to retrieve bits out of our database to close out this section:

```js
ddbResToArray(
 await db.sql`SELECT wat FROM arr`
).map(d => d.wat)
 .join(" ")
```

<simple-message id="wat-view"></simple-message>

```js
ddbResToArray(
 await db.sql`
SELECT 
  name, 
	wt AS "weight (tons)", 
	mpg AS "miles per gallon"
FROM 
  mtcars 
LIMIT 10
`)
```

<data-frame-view label="mtcars with modified colnames" id="mtcars-view"></data-frame-view>

```js
ddbResToArray(
  await db.sql`
WITH tags_unnested (cve) AS (
  SELECT 
    UNNEST(regexp_split_to_array(cves, ';')) AS cve 
  FROM 
    tags
)
SELECT 
  cve, 
  vendorProject 
FROM (
  SELECT
    cve, 
    vendorProject 
  FROM 
    tags_unnested t 
  LEFT JOIN 
    kev k 
  ON t.cve = k.cveID
) 
WHERE 
  vendorProject IS NOT NULL 
LIMIT 10
`)
```

<data-frame-view label="SQL joined tables" id="kev-view"></data-frame-view>

## FIN

We'll actually combine DuckDB machinations with WebR in the next WebR Experiment, letting R do some trivial modeling with `glm` on data we load and wrangle with DuckDB.

You can find the source [on GitHub](https://github.com/hrbrmstr/vite-duckdb).

<p style="text-align: center">Brought to you by @hrbrmstr</p>
