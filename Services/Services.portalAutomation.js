const { getBrowser } = require("./browsermanager");

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const normalizeOrigin = (origin = "") =>
  origin.replace(/^https:\/\//i, "http://");

async function clearCookies(page) {
  try {
    const cookies = await page.cookies();

    if (cookies.length > 0) {
      await page.deleteCookie(...cookies);
    }

    console.log(`🧹 Cookies cleared: ${cookies.length}`);
  } catch (error) {
    console.error(
      "⚠️ Failed to clear cookies:",
      error?.message || error
    );
  }
}

const clickConfirmButton = async ({ origin, msisdn, client_ip }) => {
  let page;

  try {
    origin = origin;
      console.log('========== msisdn' , msisdn)
      const browser = await getBrowser();
      page = await browser.newPage();

      await page.setViewport({
          width: 1280,
          height: 600
      });

      await page.setExtraHTTPHeaders({
          MSISDN: msisdn,
          "X-Forwarded-For": client_ip,
  });

    console.log("🍪 Cookies at start:", (await page.cookies()).length);
    
    if (origin.includes("vibebox.betech.lk")) {
      await page.goto(`http://consento.hutch.lk/register-service/VQ%3D%3DDg%3D%3DdQ%3D%3D`, { waitUntil: "domcontentloaded" });
      await sleep(2000);

      // await page.goto(`${origin.replace(/\/$/, "")}/send-otp.php`, {
      //   waitUntil: "domcontentloaded",
      // });

      console.log("vibebox Consent");
    }

    else if (origin.includes("begames.betech.lk")) {
      await page.goto(`http://consento.hutch.lk/register-service/VA%3D%3DCQ%3D%3DdQ%3D%3D`, { waitUntil: "domcontentloaded" });
      await sleep(2000);

      // await page.goto(`${origin.replace(/\/$/, "")}/public/subscribe.php`, {
      //   waitUntil: "domcontentloaded",
      // });

      console.log("BEGAMES Consent");
    }

    else if (origin.includes("kidzflix.betech.lk")) {
      await page.goto(`http://consento.hutch.lk/register-service/VQ%3D%3DDg%3D%3DdQ%3D%3D`, { waitUntil: "domcontentloaded" });
      await sleep(2000);

      // await page.goto(`${origin.replace(/\/$/, "")}/public/subscribe.php`, {
      //   waitUntil: "domcontentloaded",
      // });

      console.log("kidzflix Consent");
    }
    
    else {
      throw new Error("Origin not allowed");
    }

   const controls = await page.evaluate(() => {
        return Array.from(
            document.querySelectorAll("button, input, [role='button']")
        ).map((el) => ({
            tag: el.tagName,
            id: el.id || "",
            name: el.getAttribute("name") || "",
            type: el.getAttribute("type") || "",
            className: el.className || "",
            text: (el.innerText || el.value || "").trim(),
            disabled: !!el.disabled,
            visible: !!(
                el.offsetWidth ||
                el.offsetHeight ||
                el.getClientRects().length
            )
        }));
    });

    console.log("🔎 Consent controls:");
    console.dir(controls, { depth: null });
    const confirmButton = await page.waitForSelector(
        "button.btn.btn-brand.mb-3",
        {
            visible: true,
            timeout: 15000,
        }
    );

    if (!confirmButton) {
        throw new Error("Confirm button not found");
    }

    console.log("✅ Confirm button found — clicking...");

await confirmButton.click();
    await sleep(6000);
    const cookiesAfter = await page.cookies();
    console.log("🍪 Cookies before clear:", cookiesAfter.length);
  const success =
    cookiesAfter.length > 0 ||
    page.url().includes("success") ||
    page.url().includes("register");
    // 🔥 CLEAR COOKIES FOR NEXT USER
    await clearCookies(page);
    await page.close();
    return success;
  } catch (err) {
    console.error("❌ Automation failed:", err.message);
    if (page) await page.close();
    return false;
  }
};

module.exports = clickConfirmButton;