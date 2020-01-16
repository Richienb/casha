import test from "ava"
import is from "@sindresorhus/is"
import casha from "."

test("main", async (t) => {
	t.true(is.number(await casha(10, "nzd", "usd")))
	t.true(is.number(await casha(10, "nzd", "usd", { date: "2019-11-12" })))
})
