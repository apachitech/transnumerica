import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const viewports = [
  { name: '360px', width: 360, height: 800 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1280px', width: 1280, height: 900 },
];

const outputDir = path.resolve(process.cwd(), 'public', 'screenshots');
const artifactDirs = [
  'C:\\Users\\XPRISTO\\.gemini\\antigravity\\brain\\e983ad04-599c-45e1-a0de-ed51eb5f5b3e\\screenshots',
  'C:\\Users\\XPRISTO\\.gemini\\antigravity-ide\\brain\\e983ad04-599c-45e1-a0de-ed51eb5f5b3e\\screenshots',
];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
for (const dir of artifactDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function run() {
  const browser = await chromium.launch();
  const baseUrl = 'http://localhost:3000';

  const screens = [
    { name: 'home', path: '/' },
    { name: 'bus', path: '/bus?from=Kinshasa&to=Matadi' },
    { name: 'rides', path: '/rides?service=moto&pickup=Rond-point+Victoire&dropoff=Gare+Centrale' },
    { name: 'design', path: '/design' },
    { name: 'account', path: '/account' },
    { name: 'driver', path: '/driver' },
    { name: 'admin', path: '/admin' },
  ];

  for (const vp of viewports) {
    for (const mode of ['light', 'dark'] as const) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: mode,
      });

      const page = await context.newPage();

      for (const screen of screens) {
        await page.goto(`${baseUrl}${screen.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(400);

        if (mode === 'dark') {
          await page.evaluate(() => {
            localStorage.setItem('tn_theme', 'dark');
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
          });
          await page.waitForTimeout(400);
        } else {
          await page.evaluate(() => {
            localStorage.setItem('tn_theme', 'light');
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
          });
          await page.waitForTimeout(300);
        }

        const filename = `${screen.name}-${vp.name}-${mode}.png`;
        const filePath = path.join(outputDir, filename);
        await page.screenshot({ path: filePath, fullPage: false });
        for (const dir of artifactDirs) {
          fs.copyFileSync(filePath, path.join(dir, filename));
        }
        console.log(`Saved screenshot: ${filename}`);

        // Specific screenshots for bus results page
        if (screen.name === 'bus') {
          // Capture first trip card
          const firstTripCard = page.locator('article[aria-label^="Trajet"]').first();
          if (await firstTripCard.count() > 0) {
            const cardFilename = `bus-tripcard-${vp.name}-${mode}.png`;
            const cardFilePath = path.join(outputDir, cardFilename);
            await firstTripCard.screenshot({ path: cardFilePath });
            for (const dir of artifactDirs) {
              fs.copyFileSync(cardFilePath, path.join(dir, cardFilename));
            }
          }

          // Open and capture Seat Selection
          const chooseSeatBtn = page.locator('button:has-text("Choisir mon siège")').first();
          if (await chooseSeatBtn.count() > 0) {
            await chooseSeatBtn.click();
            await page.waitForTimeout(400);

            // Screenshot top-down bus layout
            const seatsFilename = `bus-seats-${vp.name}-${mode}.png`;
            const seatsFilePath = path.join(outputDir, seatsFilename);
            await page.screenshot({ path: seatsFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(seatsFilePath, path.join(dir, seatsFilename));
            }

            // Click occupied seat to show conflict alert
            const occSeat = page.locator('button[aria-label*="occupé"]').first();
            if (await occSeat.count() > 0) {
              await occSeat.click({ force: true });
              await page.waitForTimeout(300);
              const conflictFilename = `bus-seats-conflict-${vp.name}-${mode}.png`;
              const conflictFilePath = path.join(outputDir, conflictFilename);
              await page.screenshot({ path: conflictFilePath, fullPage: false });
              for (const dir of artifactDirs) {
                fs.copyFileSync(conflictFilePath, path.join(dir, conflictFilename));
              }
            }

            // Select seat 1A to show selected state, countdown timer and sticky Continuer bar
            const seat1A = page.locator('button:has-text("1A")');
            if (await seat1A.count() > 0) {
              await seat1A.click();
              await page.waitForTimeout(300);
              const selSeatsFilename = `bus-seats-selected-${vp.name}-${mode}.png`;
              const selSeatsFilePath = path.join(outputDir, selSeatsFilename);
              await page.screenshot({ path: selSeatsFilePath, fullPage: false });
              for (const dir of artifactDirs) {
                fs.copyFileSync(selSeatsFilePath, path.join(dir, selSeatsFilename));
              }

              // Proceed to Checkout to capture redesigned 3-step checkout
              const contBtn = page.locator('button:has-text("Continuer")');
              if (await contBtn.count() > 0) {
                await contBtn.click();
                await page.waitForTimeout(400);

                // Screenshot 3-step Checkout form with prefilled passenger & provider cards
                const checkoutFilename = `bus-checkout-${vp.name}-${mode}.png`;
                const checkoutFilePath = path.join(outputDir, checkoutFilename);
                await page.screenshot({ path: checkoutFilePath, fullPage: false });
                for (const dir of artifactDirs) {
                  fs.copyFileSync(checkoutFilePath, path.join(dir, checkoutFilename));
                }

                // Click Carte Bancaire tab to capture Card form
                const cardTab = page.locator('button:has-text("Carte Bancaire")');
                if (await cardTab.count() > 0) {
                  await cardTab.click();
                  await page.waitForTimeout(300);
                  const cardFilename = `bus-checkout-card-${vp.name}-${mode}.png`;
                  const cardFilePath = path.join(outputDir, cardFilename);
                  await page.screenshot({ path: cardFilePath, fullPage: false });
                  for (const dir of artifactDirs) {
                    fs.copyFileSync(cardFilePath, path.join(dir, cardFilename));
                  }
                }

                // Click Cash tab to capture Cash option
                const cashTab = page.locator('button:has-text("À l\'agence (Cash)")');
                if (await cashTab.count() > 0) {
                  await cashTab.click();
                  await page.waitForTimeout(300);
                  const cashFilename = `bus-checkout-cash-${vp.name}-${mode}.png`;
                  const cashFilePath = path.join(outputDir, cashFilename);
                  await page.screenshot({ path: cashFilePath, fullPage: false });
                  for (const dir of artifactDirs) {
                    fs.copyFileSync(cashFilePath, path.join(dir, cashFilename));
                  }
                }

                // Switch back to MOMO to capture USSD pending state
                const momoTab = page.locator('button:has-text("Mobile Money")');
                if (await momoTab.count() > 0) {
                  await momoTab.click();
                  await page.waitForTimeout(200);
                }

                // Click Confirmer et Payer to capture Full-Screen Pending State ("Validez sur votre téléphone")
                const payBtn = page.locator('button:has-text("Confirmer et Payer")');
                if (await payBtn.count() > 0) {
                  await payBtn.click();
                  await page.waitForTimeout(400);

                  const pendingFilename = `bus-checkout-pending-${vp.name}-${mode}.png`;
                  const pendingFilePath = path.join(outputDir, pendingFilename);
                  await page.screenshot({ path: pendingFilePath, fullPage: false });
                  for (const dir of artifactDirs) {
                    fs.copyFileSync(pendingFilePath, path.join(dir, pendingFilename));
                  }

                  // Wait for confirmed offline QR ticket
                  const ticketTitle = page.locator('text=Billet électronique émis !');
                  try {
                    await ticketTitle.waitFor({ timeout: 6000 });
                    const ticketFilename = `bus-checkout-ticket-${vp.name}-${mode}.png`;
                    const ticketFilePath = path.join(outputDir, ticketFilename);
                    await page.screenshot({ path: ticketFilePath, fullPage: false });
                    for (const dir of artifactDirs) {
                      fs.copyFileSync(ticketFilePath, path.join(dir, ticketFilename));
                    }

                    // 1. Capture Ticket in VALID status
                    const validFilename = `ticket-pass-valid-${vp.name}-${mode}.png`;
                    const validFilePath = path.join(outputDir, validFilename);
                    await page.screenshot({ path: validFilePath, fullPage: false });
                    for (const dir of artifactDirs) {
                      fs.copyFileSync(validFilePath, path.join(dir, validFilename));
                    }

                    // 2. Capture Ticket in USED status
                    const usedBtn = page.locator('button:has-text("Utilisé")');
                    if (await usedBtn.count() > 0) {
                      await usedBtn.click();
                      await page.waitForTimeout(200);
                      const usedFilename = `ticket-pass-used-${vp.name}-${mode}.png`;
                      const usedFilePath = path.join(outputDir, usedFilename);
                      await page.screenshot({ path: usedFilePath, fullPage: false });
                      for (const dir of artifactDirs) {
                        fs.copyFileSync(usedFilePath, path.join(dir, usedFilename));
                      }
                    }

                    // 3. Capture Ticket in EXPIRED status
                    const expiredBtn = page.locator('button:has-text("Expiré")');
                    if (await expiredBtn.count() > 0) {
                      await expiredBtn.click();
                      await page.waitForTimeout(200);
                      const expiredFilename = `ticket-pass-expired-${vp.name}-${mode}.png`;
                      const expiredFilePath = path.join(outputDir, expiredFilename);
                      await page.screenshot({ path: expiredFilePath, fullPage: false });
                      for (const dir of artifactDirs) {
                        fs.copyFileSync(expiredFilePath, path.join(dir, expiredFilename));
                      }
                    }

                    // Switch back to Valide
                    const valideBtn = page.locator('button:has-text("Valide")');
                    if (await valideBtn.count() > 0) {
                      await valideBtn.click();
                      await page.waitForTimeout(200);
                    }

                    // 4. Capture PWA "Ajouter à l'écran d'accueil" Modal
                    const pwaBtn = page.locator('button:has-text("Écran d\'accueil")');
                    if (await pwaBtn.count() > 0) {
                      await pwaBtn.click();
                      await page.waitForTimeout(250);
                      const pwaFilename = `ticket-modal-pwa-${vp.name}-${mode}.png`;
                      const pwaFilePath = path.join(outputDir, pwaFilename);
                      await page.screenshot({ path: pwaFilePath, fullPage: false });
                      for (const dir of artifactDirs) {
                        fs.copyFileSync(pwaFilePath, path.join(dir, pwaFilename));
                      }
                      const closePwa = page.locator('button:has-text("J\'ai compris")');
                      if (await closePwa.count() > 0) {
                        await closePwa.click();
                        await page.waitForTimeout(200);
                      }
                    }

                    // 5. Capture "Contacter l'opérateur" Modal
                    const contactBtn = page.locator('button:has-text("Contacter l\'opérateur")');
                    if (await contactBtn.count() > 0) {
                      await contactBtn.click();
                      await page.waitForTimeout(250);
                      const contactFilename = `ticket-modal-contact-${vp.name}-${mode}.png`;
                      const contactFilePath = path.join(outputDir, contactFilename);
                      await page.screenshot({ path: contactFilePath, fullPage: false });
                      for (const dir of artifactDirs) {
                        fs.copyFileSync(contactFilePath, path.join(dir, contactFilename));
                      }
                      const closeContact = page.locator('button:has-text("Fermer")');
                      if (await closeContact.count() > 0) {
                        await closeContact.click();
                        await page.waitForTimeout(200);
                      }
                    }
                  } catch (e) {
                    console.warn('Ticket screenshot error:', e);
                  }
                }
              }
            }

            // Return to list view
            await page.goto(`${baseUrl}/bus?from=Kinshasa&to=Matadi`, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(300);
          }

          // Open and capture Modify Search Modal
          const modifyBtn = page.locator('button:has-text("Modifier la recherche")');
          if (await modifyBtn.count() > 0) {
            await modifyBtn.click();
            await page.waitForTimeout(300);
            const modifyFilename = `bus-modify-${vp.name}-${mode}.png`;
            const modifyFilePath = path.join(outputDir, modifyFilename);
            await page.screenshot({ path: modifyFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(modifyFilePath, path.join(dir, modifyFilename));
            }
            const closeBtn = page.locator('button[aria-label="Fermer la boîte de modification"]');
            if (await closeBtn.count() > 0) {
              await closeBtn.click();
              await page.waitForTimeout(200);
            }
          }

          // Capture empty state
          await page.goto(`${baseUrl}/bus?from=Kinshasa&to=Bunia`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(400);
          const emptyFilename = `bus-empty-${vp.name}-${mode}.png`;
          const emptyFilePath = path.join(outputDir, emptyFilename);
          await page.screenshot({ path: emptyFilePath, fullPage: false });
          for (const dir of artifactDirs) {
            fs.copyFileSync(emptyFilePath, path.join(dir, emptyFilename));
          }

          // Return to results to capture Verified Badge Explanation Sheet and Help Center Modal
          await page.goto(`${baseUrl}/bus?from=Kinshasa&to=Matadi`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(300);

          const verifiedBadgeBtn = page.locator('button:has-text("Vérifié")').first();
          if (await verifiedBadgeBtn.count() > 0) {
            await verifiedBadgeBtn.click();
            await page.waitForTimeout(250);
            const vFilename = `verified-modal-${vp.name}-${mode}.png`;
            const vFilePath = path.join(outputDir, vFilename);
            await page.screenshot({ path: vFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(vFilePath, path.join(dir, vFilename));
            }
            const closeV = page.locator('button:has-text("Compris, fermer")');
            if (await closeV.count() > 0) {
              await closeV.click();
              await page.waitForTimeout(200);
            }
          }

          const helpBtn = page.locator('button[aria-label="Centre d\'aide et assistance"]');
          if (await helpBtn.count() > 0) {
            await helpBtn.click();
            await page.waitForTimeout(250);
            const hFilename = `help-center-${vp.name}-${mode}.png`;
            const hFilePath = path.join(outputDir, hFilename);
            await page.screenshot({ path: hFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(hFilePath, path.join(dir, hFilename));
            }
            const closeH = page.locator('button:has-text("Fermer le centre d\'aide")');
            if (await closeH.count() > 0) {
              await closeH.click();
              await page.waitForTimeout(200);
            }
          }
        }

        // Specific screenshots for the redesigned live ride flow
        if (screen.name === 'rides') {
          // 1. Capture State 1: Searching (radar)
          const searchFilename = `rides-searching-${vp.name}-${mode}.png`;
          const searchFilePath = path.join(outputDir, searchFilename);
          await page.screenshot({ path: searchFilePath, fullPage: false });
          for (const dir of artifactDirs) {
            fs.copyFileSync(searchFilePath, path.join(dir, searchFilename));
          }

          // Open and capture Cancel Modal with consequences
          const cancelBtn = page.locator('button:has-text("Annuler la course")');
          if (await cancelBtn.count() > 0) {
            await cancelBtn.click();
            await page.waitForTimeout(250);
            const cancelFilename = `rides-cancel-modal-${vp.name}-${mode}.png`;
            const cancelFilePath = path.join(outputDir, cancelFilename);
            await page.screenshot({ path: cancelFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(cancelFilePath, path.join(dir, cancelFilename));
            }
            const keepBtn = page.locator('button:has-text("Garder ma course")');
            if (await keepBtn.count() > 0) {
              await keepBtn.click();
              await page.waitForTimeout(200);
            }
          }

          // Wait for offers to stream in -> State 2: Choosing an Offer
          const acceptBtn = page.locator('button:has-text("Accepter cette offre")').first();
          try {
            await acceptBtn.waitFor({ timeout: 4000 });
            // Click "Négocier" to show counter-offer option
            const negotiateBtn = page.locator('button:has-text("Négocier")').first();
            if (await negotiateBtn.count() > 0) {
              await negotiateBtn.click();
              await page.waitForTimeout(200);
            }
            const offersFilename = `rides-offers-${vp.name}-${mode}.png`;
            const offersFilePath = path.join(outputDir, offersFilename);
            await page.screenshot({ path: offersFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(offersFilePath, path.join(dir, offersFilename));
            }

            // Accept offer -> State 3: Driver on the way
            await acceptBtn.click();
            await page.waitForTimeout(300);
            const arrivingFilename = `rides-arriving-${vp.name}-${mode}.png`;
            const arrivingFilePath = path.join(outputDir, arrivingFilename);
            await page.screenshot({ path: arrivingFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(arrivingFilePath, path.join(dir, arrivingFilename));
            }

            // Start ride -> State 4: Ride in progress
            const startTripBtn = page.locator('button:has-text("Démarrer la course")');
            if (await startTripBtn.count() > 0) {
              await startTripBtn.click();
              await page.waitForTimeout(300);
              const inProgFilename = `rides-inprogress-${vp.name}-${mode}.png`;
              const inProgFilePath = path.join(outputDir, inProgFilename);
              await page.screenshot({ path: inProgFilePath, fullPage: false });
              for (const dir of artifactDirs) {
                fs.copyFileSync(inProgFilePath, path.join(dir, inProgFilename));
              }
            }

            // Complete ride -> State 5: Completed
            const arrivalBtn = page.locator('button:has-text("Simuler Arrivée à Destination")');
            if (await arrivalBtn.count() > 0) {
              await arrivalBtn.click();
              await page.waitForTimeout(300);
              const compFilename = `rides-completed-${vp.name}-${mode}.png`;
              const compFilePath = path.join(outputDir, compFilename);
              await page.screenshot({ path: compFilePath, fullPage: false });
              for (const dir of artifactDirs) {
                fs.copyFileSync(compFilePath, path.join(dir, compFilename));
              }
            }
          } catch (e) {
            console.warn('Rides screenshots warning:', e);
          }
        }

        // Full page for home
        if (screen.name === 'home') {
          const fullFilename = `home-${vp.name}-${mode}-full.png`;
          const fullFilePath = path.join(outputDir, fullFilename);
          await page.screenshot({ path: fullFilePath, fullPage: true });
          for (const dir of artifactDirs) {
            fs.copyFileSync(fullFilePath, path.join(dir, fullFilename));
          }

          // Specific screenshot of the rebuilt Bus Search Card
          const busCardElement = page.locator('form[aria-label="Recherche de trajets de bus interurbains"]');
          if (await busCardElement.count() > 0) {
            const cardFilename = `bus-card-${vp.name}-${mode}.png`;
            const cardFilePath = path.join(outputDir, cardFilename);
            await busCardElement.first().screenshot({ path: cardFilePath });
            for (const dir of artifactDirs) {
              fs.copyFileSync(cardFilePath, path.join(dir, cardFilename));
            }
          }

          // Trigger autocomplete dropdown on destination input for visual proof
          const destInput = page.locator('#bus-destination-input');
          if (await destInput.count() > 0) {
            await destInput.focus();
            await page.waitForTimeout(300);
            const autoFilename = `bus-autocomplete-${vp.name}-${mode}.png`;
            const autoFilePath = path.join(outputDir, autoFilename);
            await page.screenshot({ path: autoFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(autoFilePath, path.join(dir, autoFilename));
            }
            await page.keyboard.press('Escape');
          }

          // Switch to Wewa (Moto) tab to capture the rebuilt RideRequestCard
          const motoTab = page.locator('button:has-text("Wewa (Moto)")');
          if (await motoTab.count() > 0) {
            await motoTab.first().click();
            await page.waitForTimeout(400);

            const rideCard = page.locator('form[aria-label="Formulaire de demande de Taxi et Moto"]');
            if (await rideCard.count() > 0) {
              const rideFilename = `ride-card-${vp.name}-${mode}.png`;
              const rideFilePath = path.join(outputDir, rideFilename);
              await rideCard.first().screenshot({ path: rideFilePath });
              for (const dir of artifactDirs) {
                fs.copyFileSync(rideFilePath, path.join(dir, rideFilename));
              }
            }

            // Also capture full home view with Moto active
            const homeMotoFilename = `home-moto-${vp.name}-${mode}.png`;
            const homeMotoFilePath = path.join(outputDir, homeMotoFilename);
            await page.screenshot({ path: homeMotoFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(homeMotoFilePath, path.join(dir, homeMotoFilename));
            }
          }
        }

        // Specific screenshots for Account page
        if (screen.name === 'account') {
          await page.waitForTimeout(400);

          // 1. Receipt Modal screenshot
          const receiptBtn = page.locator('button[data-testid="trip-receipt-btn"]').first();
          if (await receiptBtn.count() > 0) {
            await receiptBtn.click();
            await page.waitForTimeout(400);

            const receiptFilename = `account-receipt-modal-${vp.name}-${mode}.png`;
            const receiptFilePath = path.join(outputDir, receiptFilename);
            await page.screenshot({ path: receiptFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(receiptFilePath, path.join(dir, receiptFilename));
            }
            console.log(`Saved screenshot: ${receiptFilename}`);

            const closeBtn = page.locator('button[aria-label="Fermer le reçu"]');
            if (await closeBtn.count() > 0) {
              await closeBtn.click();
              await page.waitForTimeout(300);
            }
          }

          // 2. Saved Places Tab
          const placesTab = page.locator('button:has-text("Adresses")').first();
          if (await placesTab.count() > 0) {
            await placesTab.click();
            await page.waitForTimeout(350);

            const placesFilename = `account-places-${vp.name}-${mode}.png`;
            const placesFilePath = path.join(outputDir, placesFilename);
            await page.screenshot({ path: placesFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(placesFilePath, path.join(dir, placesFilename));
            }
            console.log(`Saved screenshot: ${placesFilename}`);
          }

          // 3. Saved Payments Tab
          const paymentsTab = page.locator('button:has-text("Paiements")').first();
          if (await paymentsTab.count() > 0) {
            await paymentsTab.click();
            await page.waitForTimeout(350);

            const paymentsFilename = `account-payments-${vp.name}-${mode}.png`;
            const paymentsFilePath = path.join(outputDir, paymentsFilename);
            await page.screenshot({ path: paymentsFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(paymentsFilePath, path.join(dir, paymentsFilename));
            }
            console.log(`Saved screenshot: ${paymentsFilename}`);
          }

          // 4. Settings & Preferences Tab
          const settingsTab = page.locator('button:has-text("Paramètres")').first();
          if (await settingsTab.count() > 0) {
            await settingsTab.click();
            await page.waitForTimeout(350);

            const settingsFilename = `account-settings-${vp.name}-${mode}.png`;
            const settingsFilePath = path.join(outputDir, settingsFilename);
            await page.screenshot({ path: settingsFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(settingsFilePath, path.join(dir, settingsFilename));
            }
            console.log(`Saved screenshot: ${settingsFilename}`);
          }
        }

        // Specific screenshots for Driver In-Vehicle experience
        if (screen.name === 'driver') {
          await page.waitForTimeout(400);

          // 1. High-Contrast Night Driving Mode
          const nightBtn = page.locator('button[data-testid="driver-night-mode-toggle"]').first();
          if (await nightBtn.count() > 0) {
            await nightBtn.click();
            await page.waitForTimeout(300);

            const nightFilename = `driver-nightmode-${vp.name}-${mode}.png`;
            const nightFilePath = path.join(outputDir, nightFilename);
            await page.screenshot({ path: nightFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(nightFilePath, path.join(dir, nightFilename));
            }
            console.log(`Saved screenshot: ${nightFilename}`);

            // Toggle back
            await nightBtn.click();
            await page.waitForTimeout(200);
          }

          // 2. Active Trip Flow (Accept request)
          const acceptBtn = page.locator('button[data-testid="driver-accept-request-btn"]').first();
          if (await acceptBtn.count() > 0) {
            await acceptBtn.click();
            await page.waitForTimeout(400);

            const activeTripFilename = `driver-active-trip-${vp.name}-${mode}.png`;
            const activeTripFilePath = path.join(outputDir, activeTripFilename);
            await page.screenshot({ path: activeTripFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(activeTripFilePath, path.join(dir, activeTripFilename));
            }
            console.log(`Saved screenshot: ${activeTripFilename}`);

            // Test PIN and Trip Started
            const autoPinBtn = page.locator('button:has-text("Auto 4821")').first();
            if (await autoPinBtn.count() > 0) {
              await autoPinBtn.click();
              await page.waitForTimeout(200);
              await page.locator('button[data-testid="driver-start-trip-btn"]').click();
              await page.waitForTimeout(300);

              const tripStartedFilename = `driver-trip-started-${vp.name}-${mode}.png`;
              const tripStartedFilePath = path.join(outputDir, tripStartedFilename);
              await page.screenshot({ path: tripStartedFilePath, fullPage: false });
              for (const dir of artifactDirs) {
                fs.copyFileSync(tripStartedFilePath, path.join(dir, tripStartedFilename));
              }
              console.log(`Saved screenshot: ${tripStartedFilename}`);

              // Complete trip
              const completeBtn = page.locator('button[data-testid="driver-complete-trip-btn"]').first();
              if (await completeBtn.count() > 0) {
                await completeBtn.click();
                await page.waitForTimeout(300);
              }
            }
          }

          // 3. Mobile Money Payout Modal
          const payoutBtn = page.locator('button[data-testid="driver-request-payout-btn"]').first();
          if (await payoutBtn.count() > 0) {
            await payoutBtn.click();
            await page.waitForTimeout(350);

            const payoutFilename = `driver-payout-modal-${vp.name}-${mode}.png`;
            const payoutFilePath = path.join(outputDir, payoutFilename);
            await page.screenshot({ path: payoutFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(payoutFilePath, path.join(dir, payoutFilename));
            }
            console.log(`Saved screenshot: ${payoutFilename}`);

            const closeBtn = page.locator('button[aria-label="Fermer"]');
            if (await closeBtn.count() > 0) {
              await closeBtn.click();
              await page.waitForTimeout(200);
            }
          }
        }

        // Specific screenshots for Admin dashboard
        if (screen.name === 'admin') {
          const navigateAdminTab = async (tabName: string) => {
            const mobileMenuBtn = page.locator('button[data-testid="admin-mobile-menu-btn"]');
            if (await mobileMenuBtn.isVisible()) {
              await mobileMenuBtn.click();
              await page.waitForTimeout(300);
            }
            await page.locator(`button[data-testid="admin-nav-${tabName}"]`).click();
            await page.waitForTimeout(350);
          };

          // 1. Bookings tab
          await navigateAdminTab('bookings');
          const bookingsFilename = `admin-bookings-${vp.name}-${mode}.png`;
          const bookingsFilePath = path.join(outputDir, bookingsFilename);
          await page.screenshot({ path: bookingsFilePath, fullPage: false });
          for (const dir of artifactDirs) {
            fs.copyFileSync(bookingsFilePath, path.join(dir, bookingsFilename));
          }
          console.log(`Saved screenshot: ${bookingsFilename}`);

          // 2. KYC Verification tab
          await navigateAdminTab('verification');
          const kycFilename = `admin-kyc-${vp.name}-${mode}.png`;
          const kycFilePath = path.join(outputDir, kycFilename);
          await page.screenshot({ path: kycFilePath, fullPage: false });
          for (const dir of artifactDirs) {
            fs.copyFileSync(kycFilePath, path.join(dir, kycFilename));
          }
          console.log(`Saved screenshot: ${kycFilename}`);

          // Open Document Preview Modal
          const previewBtn = page.locator('button[data-testid="preview-docs-btn-kyc-1"]').first();
          if (await previewBtn.count() > 0) {
            await previewBtn.click();
            await page.waitForTimeout(350);
            const docModalFilename = `admin-doc-modal-${vp.name}-${mode}.png`;
            const docModalFilePath = path.join(outputDir, docModalFilename);
            await page.screenshot({ path: docModalFilePath, fullPage: false });
            for (const dir of artifactDirs) {
              fs.copyFileSync(docModalFilePath, path.join(dir, docModalFilename));
            }
            console.log(`Saved screenshot: ${docModalFilename}`);

            const closeDocBtn = page.locator('button[aria-label="Fermer la prévisualisation"]').first();
            if (await closeDocBtn.count() > 0) {
              await closeDocBtn.click();
              await page.waitForTimeout(300);
            }
          }

          // 3. City & Service Toggles tab
          await navigateAdminTab('city_services');
          const togglesFilename = `admin-toggles-${vp.name}-${mode}.png`;
          const togglesFilePath = path.join(outputDir, togglesFilename);
          await page.screenshot({ path: togglesFilePath, fullPage: false });
          for (const dir of artifactDirs) {
            fs.copyFileSync(togglesFilePath, path.join(dir, togglesFilename));
          }
          console.log(`Saved screenshot: ${togglesFilename}`);

          // 4. Dispute Management tab
          await navigateAdminTab('disputes');
          const disputesFilename = `admin-disputes-${vp.name}-${mode}.png`;
          const disputesFilePath = path.join(outputDir, disputesFilename);
          await page.screenshot({ path: disputesFilePath, fullPage: false });
          for (const dir of artifactDirs) {
            fs.copyFileSync(disputesFilePath, path.join(dir, disputesFilename));
          }
          console.log(`Saved screenshot: ${disputesFilename}`);
        }
      }

      await context.close();
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
