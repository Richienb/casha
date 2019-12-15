import test from "ava"
import is from "@sindresorhus/is"
import decpl from "decpl"
import casha from "."

test("main", async (t) => {
    t.true(is.number(await casha(10, "nzd", "usd")))
    t.is(decpl(await casha(10, "nzd", "usd")), 2)
    t.true(is.number(await casha(10, "nzd", "usd", { date: "2019-11-12" })))
    t.is(decpl(await casha(10, "nzd", "usd", { precision: 4 })), 4)
})
