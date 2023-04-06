import './status-message.js'
import './simple-message.js'
import './data-frame-view.js'
import { describeObject } from  "./utils.js"

let webrMessage = document.getElementById("webr-status");
webrMessage.text = ""

import './r.js'

import { DuckDBClient, ddbResToArray, FileAttachment } from "./duckdb.js";

await R`R.version.string` // do something with WebR just to prove it can coexist

webrMessage.text = "WebR Loaded!"

// FileAttachment does not seem to grok relative bare path "URLs" so
// we help it out using the URL the user used to get here
const mtcars = await FileAttachment(`${window.location.href}/mtcars.csv`).csv({ typed: true })

// some external data just to show "fancy" SQL
const kev = await FileAttachment("https://rud.is/data/kev.json").json()
const tags = await FileAttachment("https://rud.is/data/tags.json").json()

let bareFa = document.getElementById("bare-fa")
bareFa.text = await FileAttachment("https://rud.is/remote-ip").text()

// stick a few "tables" in our "database"
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
})

let descTbls = document.getElementById("describe-tables")
descTbls.text = (await db.describeTables()).map(d => `- name: "${d.name}"`).join("\n")

const kevSchema = await db.describeColumns({ table: "kev" })
let kevSchemaView = document.getElementById("kev-schema")
kevSchemaView.dataFrame = kevSchema

let watView = document.getElementById("wat-view")
watView.text = (await db.sql`SELECT wat FROM arr`).map(d => d.wat).join(" ")


let mtcarsView = document.getElementById("mtcars-view")
mtcarsView.dataFrame = ddbResToArray(
	await db.sql`
SELECT 
  name, 
	wt AS "weight (tons)", 
	mpg AS "miles per gallon"
FROM 
  mtcars 
LIMIT 10
`)

let kevView = document.getElementById("kev-view")
kevView.dataFrame = ddbResToArray(
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