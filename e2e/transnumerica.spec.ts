import { test, expect } from '@playwright/test';

test.describe('Transnumerica DR Congo E2E Test Suite', () => {
  // Test 1: Bus booking flow end to end with seat selection, Mobile Money and QR ticket
  test('1. Bus booking with seat selection, Mobile Money payment and offline QR ticket', async ({ page }) => {
    await page.goto('/bus?from=Kinshasa&to=Matadi');

    // Verify search results header
    await expect(page.locator('span:text-is("Kinshasa")').first()).toBeVisible();
    await expect(page.locator('span:text-is("Matadi")').first()).toBeVisible();

    // Click "Choisir mon siège" on the first bus trip
    const selectSeatBtn = page.locator('button:has-text("Choisir mon siège")').first();
    await selectSeatBtn.click();

    // Verify Seat map is displayed with driver cabin
    await expect(page.locator('text=Cabine Chauffeur')).toBeVisible();

    // Select first available (non-disabled) seat
    const seatBtn = page.locator('button:has-text("1A")');
    await seatBtn.click();

    // Click continue to checkout
    const continueBtn = page.locator('button:has-text("Continuer")');
    await continueBtn.click();

    // Verify Checkout form
    await expect(page.locator('text=Récapitulatif & Paiement')).toBeVisible();
    await expect(page.locator('text=Mobile Money').first()).toBeVisible();

    // Submit payment
    const payBtn = page.locator('button:has-text("Confirmer et Payer")');
    await payBtn.click();

    // Wait for USSD processing simulation and offline QR ticket display
    await expect(page.locator('text=Billet électronique émis !')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Ce billet fonctionne hors-connexion')).toBeVisible();
    await expect(page.locator('text=Envoyer sur WhatsApp')).toBeVisible();
    await expect(page.locator('img[alt^="Billet QR Code:"]')).toBeVisible();
  });

  // Test 2: Moto ride request with inDrive offers, safety PIN and cash confirmation
  test('2. Moto ride request with inDrive offers, safety PIN and cash confirmation', async ({ page }) => {
    await page.goto('/rides?service=moto&pickup=Rond-point+Victoire&dropoff=Gare+Centrale&proposedFare=350000&currency=CDF&helmet=true');

    // Verify map and searching state
    await expect(page.locator('text=Rond-point Victoire').first()).toBeVisible();

    // Wait for driver offers to appear (Dany or Fidèle)
    const acceptOfferBtn = page.locator('button:has-text("Accepter cette offre")').first();
    await expect(acceptOfferBtn).toBeVisible({ timeout: 10000 });

    // Verify verified badge and plate number
    await expect(page.locator('text=Vérifié').first()).toBeVisible();

    // Accept offer
    await acceptOfferBtn.click();

    // Verify Safety Trip PIN modal is rendered
    await expect(page.locator('text=Code PIN de sécurité')).toBeVisible();
    await expect(page.locator('text=Donnez ce code à votre chauffeur')).toBeVisible();

    // Verify WhatsApp live trip share button is available
    await expect(page.locator('text=Partager le trajet sur WhatsApp')).toBeVisible();

    // Complete ride and verify cash confirmation
    const simulateArrivalBtn = page.locator('button:has-text("Simuler Arrivée à Destination")');
    await simulateArrivalBtn.click();

    await expect(page.locator('text=Paiement en espèces').first()).toBeVisible();
    await expect(page.locator('text=Arrivé à destination !')).toBeVisible();
  });

  // Test 3: City where Moto is disabled shows clear alert and disables request (Kolwezi)
  test('3. City where Moto is disabled shows clear alert and disables request (Kolwezi)', async ({ page }) => {
    await page.goto('/');

    // Select Kolwezi from visible city selector in header
    const visibleCitySelect = page.locator('header select').locator('visible=true');
    await visibleCitySelect.selectOption('kolwezi');

    // Click on Wewa (Moto) tab
    const motoTab = page.locator('button:has-text("Wewa (Moto)")');
    await motoTab.click();

    // Verify the municipal restriction banner is displayed
    await expect(
      page.locator('text=Service indisponible à Kolwezi')
    ).toBeVisible();

    await expect(
      page.locator('text=Arrêté municipal n°2026/04 : Circulation des mototaxis temporairement suspendue')
    ).toBeVisible();

    // Verify the submit button is disabled
    const requestBtn = page.locator('button:has-text("Trouver un Wewa (Moto)")');
    await expect(requestBtn).toBeDisabled();
  });

  // Test 4: Design system showcase displays tokens, WCAG AA contrast matrix and components
  test('4. Design system showcase displays tokens, WCAG AA contrast matrix and components', async ({ page }) => {
    await page.goto('/design');

    // Verify title and header
    await expect(page.locator('h1:has-text("Transnumerica Design System")')).toBeVisible();

    // Verify WCAG section
    await expect(page.locator('text=Audit de Contraste WCAG AA / AAA')).toBeVisible();
    await expect(page.locator('text=Primary 900 (#0A2540)').first()).toBeVisible();
    await expect(page.locator('text=14.2:1').first()).toBeVisible();

    // Verify typography scale section
    await expect(page.locator('text=Plus Jakarta Sans').first()).toBeVisible();
    await expect(page.locator('text=text-4xl').first()).toBeVisible();

    // Verify Mobile Money operator colors
    await expect(page.locator('span:text-is("Vodacom M-Pesa")').first()).toBeVisible();
    await expect(page.locator('span:text-is("Airtel Money")').first()).toBeVisible();
  });

  // Test 5: Rebuilt Bus Search Card (autocomplete, animated swap, date chips, passenger stepper & validation)
  test('5. Rebuilt Bus Search Card: autocomplete, animated swap, date chips, passenger stepper and validation', async ({ page }) => {
    await page.goto('/');

    const depInput = page.locator('#bus-departure-input');
    const destInput = page.locator('#bus-destination-input');

    // Verify initial values
    await expect(depInput).toBeVisible();
    await expect(destInput).toBeVisible();

    // Verify swap button swaps values
    const originalDep = await depInput.inputValue();
    const originalDest = await destInput.inputValue();
    const swapBtn = page.locator('button[aria-label="Inverser la ville de départ et la destination"]');
    await swapBtn.click();
    await expect(depInput).toHaveValue(originalDest);
    await expect(destInput).toHaveValue(originalDep);

    // Verify Quick date chip "Demain"
    const demainChip = page.locator('button:has-text("Demain")');
    await expect(demainChip).toBeVisible();
    await demainChip.click();

    // Verify Passenger stepper increment & decrement
    const stepperSpin = page.locator('[role="spinbutton"]');
    await expect(stepperSpin).toHaveAttribute('aria-valuenow', '1');

    const incrementBtn = page.locator('button[aria-label="Augmenter le nombre de passagers"]');
    await incrementBtn.click();
    await expect(stepperSpin).toHaveAttribute('aria-valuenow', '2');

    const decrementBtn = page.locator('button[aria-label="Diminuer le nombre de passagers"]');
    await decrementBtn.click();
    await expect(stepperSpin).toHaveAttribute('aria-valuenow', '1');

    // Test inline validation: set departure same as destination
    await depInput.fill('Kinshasa');
    await destInput.fill('Kinshasa');
    const searchBtn = page.locator('button:has-text("Rechercher un bus")');
    await searchBtn.click();

    // Inline error must appear
    await expect(page.locator('text=La destination doit être différente de la ville de départ')).toBeVisible();

    // Fix destination to Matadi
    await destInput.fill('Matadi');
    await searchBtn.click();

    // Should navigate to /bus with parameters
    await page.waitForURL(/\/bus\?from=Kinshasa&to=Matadi/);
    await expect(page.locator('span:text-is("Kinshasa")').first()).toBeVisible();
    await expect(page.locator('span:text-is("Matadi")').first()).toBeVisible();
  });

  // Test 6: Rebuilt Taxi & Moto Request Card (3-tap request, saved places, vehicle toggle, ETA, fare chips & map preview)
  test('6. Rebuilt Taxi & Moto Request Card: 3-tap request, saved places, vehicle toggle, ETA, fare chips and map preview', async ({ page }) => {
    await page.goto('/');

    // Switch to Moto tab
    const motoTab = page.locator('button:has-text("Wewa (Moto)")');
    await motoTab.click();

    // Verify Vehicle Type comparison toggle displays ETA and prices
    await expect(page.locator('button:has-text("Wewa (Moto)"):has-text("min")')).toBeVisible();
    await expect(page.locator('button:has-text("Taxi (Voiture)"):has-text("min")')).toBeVisible();

    // Verify Map preview is rendered and can be toggled
    await expect(page.locator('text=Aperçu du Trajet')).toBeVisible();
    const mapPreview = page.locator('[data-testid="ride-map-preview"]');
    await expect(mapPreview).toBeVisible();

    const toggleMapBtn = page.locator('[data-testid="toggle-map-preview"]');
    await toggleMapBtn.click();
    await expect(mapPreview).not.toBeVisible();
    await toggleMapBtn.click();
    await expect(mapPreview).toBeVisible();

    // Tap 1: Click Saved Place chip "Travail"
    const travailChip = page.locator('button:has-text("Travail")');
    await expect(travailChip).toBeVisible();
    await travailChip.click();

    // Destination input should now have the work address
    const dropoffInput = page.locator('input[placeholder*="Gare Centrale"]');
    await expect(dropoffInput).toHaveValue('Gare Centrale, Boulevard du 30 Juin');

    // Tap 2: Select "Conseillé" fare chip
    const conseilléChip = page.locator('button:has-text("Conseillé")');
    await expect(conseilléChip).toBeVisible();
    await conseilléChip.click();

    // Verify fare hint indicates good/quick offers
    await expect(page.locator('text=Bon tarif !').or(page.locator('text=Tarif un peu bas'))).toBeVisible();

    // Tap 3: Click dominant "Demander un Wewa (Moto)" button
    const demanderBtn = page.locator('button:has-text("Demander un Wewa (Moto)")');
    await expect(demanderBtn).toBeVisible();
    await demanderBtn.click();

    // Verify seamless navigation to /rides with parameters
    await page.waitForURL(/\/rides\?service=moto/);
    await expect(page.locator('text=Rond-point Victoire').first()).toBeVisible();
  });

  // Test 7: Redesigned Bus Results Page (sticky summary bar, modifier modal, verified badges, filters & empty state)
  test('7. Redesigned Bus Results Page: sticky summary, modifier modal, verified badge, filters and empty state', async ({ page }) => {
    await page.goto('/bus?from=Kinshasa&to=Matadi');

    // 1. Sticky Summary Bar verification
    await expect(page.locator('span:text-is("Kinshasa")').first()).toBeVisible();
    await expect(page.locator('span:text-is("Matadi")').first()).toBeVisible();
    await expect(page.locator('text=départs trouvés')).toBeVisible();

    // 2. Verified badges & operator logo
    await expect(page.locator('span:text-is("Vérifié")').first()).toBeVisible();
    await expect(page.locator('article:has-text("Matadi Express VIP")').first()).toBeVisible();

    // 3. Modifier action button & modal
    const modifyBtn = page.locator('button:has-text("Modifier la recherche")');
    await expect(modifyBtn).toBeVisible();
    await modifyBtn.click();

    // Modal dialog is opened
    await expect(page.locator('#modify-search-title')).toBeVisible();
    await expect(page.locator('button:has-text("Appliquer")')).toBeVisible();

    // Close modal via close button
    const closeBtn = page.locator('button[aria-label="Fermer la boîte de modification"]');
    await closeBtn.click();
    await expect(page.locator('#modify-search-title')).not.toBeVisible();

    // 4. Test Filters on Mobile / Desktop
    const filterBtn = page.locator('button[aria-label="Ouvrir les filtres et options de tri"]');
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      const vipFilter = page.locator('button:has-text("Classe VIP (Clim, Wi-Fi 4G)")').locator('visible=true');
      await vipFilter.click();

      // Close bottom sheet if visible
      const submitFiltersBtn = page.locator('button:has-text("Voir les")').locator('visible=true');
      if (await submitFiltersBtn.isVisible()) {
        await submitFiltersBtn.click();
      }
    }

    // 5. Test friendly empty state on non-existent route
    await page.goto('/bus?from=Kinshasa&to=Bunia');
    await expect(page.locator('text=Aucun autocar direct trouvé pour cette date')).toBeVisible();
    await expect(page.locator('text=Kinshasa ➔ Matadi')).toBeVisible();
    await expect(page.locator('button:has-text("Demain (+1 jour)")')).toBeVisible();
  });

  // Test 8: Interactive Bus Seat Selection with Top-Down Coach, Women Reserved, Seat Hold & Concurrency Conflict
  test('8. Redesigned Bus Seat Selection: top-down coach, women-reserved seats, seat hold and conflict simulation', async ({ page }) => {
    // Test on 360px mobile viewport to ensure no horizontal overflow
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/bus?from=Kinshasa&to=Matadi');

    // Click "Choisir mon siège" on the first bus trip
    const selectSeatBtn = page.locator('button:has-text("Choisir mon siège")').first();
    await selectSeatBtn.click();

    // Verify top-down coach elements: Driver cabin, mirrors, entrance door, rear exit/toilets
    await expect(page.locator('text=Cabine Chauffeur')).toBeVisible();
    await expect(page.locator('text=Autocar Grand Confort')).toBeVisible();
    await expect(page.locator('text=Porte Passagers')).toBeVisible();
    await expect(page.locator('text=Sortie de secours')).toBeVisible();

    // Verify Legend items
    await expect(page.locator('text=Libre')).toBeVisible();
    await expect(page.locator('text=Sélectionné')).toBeVisible();
    await expect(page.locator('text=Occupé')).toBeVisible();
    await expect(page.locator('text=Femmes')).toBeVisible();

    // Verify women-reserved seat indicator exists
    const womenSeatBtn = page.locator('button[aria-label*="réservé aux femmes"]').first();
    await expect(womenSeatBtn).toBeVisible();

    // Test conflict simulation: click an occupied seat (e.g. 1B which is occupied in mock data)
    const occupiedSeat = page.locator('button[aria-label*="occupé"]').first();
    await occupiedSeat.click({ force: true });
    await expect(page.locator('text=Conflit de réservation instantané')).toBeVisible();
    await expect(page.locator('text=Ce siège')).toBeVisible();

    // Select available seat 1A
    const seat1A = page.locator('button:has-text("1A")');
    await seat1A.click();

    // Verify seat hold countdown timer appears
    await expect(page.locator('text=Siège 1A bloqué pour vous')).toBeVisible();
    await expect(page.locator('text=Anti-conflit')).toBeVisible();

    // Verify sticky Continuer bar shows live running total and enabled button
    const stickyTotal = page.locator('span:has-text("Total à payer")');
    await expect(stickyTotal).toBeVisible();

    const continueBtn = page.locator('button:has-text("Continuer")');
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Successfully transitioned to Step 3 Checkout
    await expect(page.locator('text=Récapitulatif & Paiement')).toBeVisible();
  });

  // Test 9: Trustworthy 3-step Checkout Flow (Prefilled details, 4 providers, format validation, USD toggle, USSD pending & resend)
  test('9. Redesigned 3-step Checkout: prefilled passenger, provider logos, validation, USD toggle and full-screen USSD pending state', async ({ page }) => {
    await page.goto('/bus?from=Kinshasa&to=Matadi');

    // Select seat 1A and proceed to checkout
    await page.locator('button:has-text("Choisir mon siège")').first().click();
    await page.locator('button:has-text("1A")').click();
    await page.locator('button:has-text("Continuer")').click();

    // 1. Verify 3-step checkout header & prefilled passenger details
    await expect(page.locator('text=Récapitulatif & Paiement')).toBeVisible();
    await expect(page.locator('text=Coordonnées du passager')).toBeVisible();
    await expect(page.locator('#passenger-fullname')).toHaveValue('Patrick Mwamba');

    // 2. Verify all 4 DRC Mobile Money provider cards with logos & taglines
    await expect(page.locator('button:has-text("Vodacom M-Pesa")')).toBeVisible();
    await expect(page.locator('button:has-text("Airtel Money")')).toBeVisible();
    await expect(page.locator('button:has-text("Orange Money")')).toBeVisible();
    await expect(page.locator('button:has-text("Africell Money")')).toBeVisible();

    // 3. Test operator format validation (select Orange Money and input invalid prefix)
    const orangeBtn = page.locator('button:has-text("Orange Money")');
    await orangeBtn.click();
    const momoPhoneInput = page.locator('#momo-account-phone');
    await momoPhoneInput.fill('0812345678'); // 081 is Vodacom, not Orange
    await expect(page.locator('text=Ce numéro ne correspond pas au réseau Orange Money')).toBeVisible();

    // Correct to valid Orange prefix (089)
    await momoPhoneInput.fill('0891234567');
    await expect(page.locator('text=Ce numéro ne correspond pas au réseau Orange Money')).not.toBeVisible();

    // 4. Test price breakdown and USD currency toggle
    await expect(page.locator('text=Détail de la tarification')).toBeVisible();
    await expect(page.locator('text=0 FC (Inclus / Offerts)')).toBeVisible();

    // Switch currency to USD
    const usdBtn = page.locator('button:has-text("Dollar (USD)")');
    await usdBtn.click();
    await expect(page.locator('text=0 USD (Inclus / Offerts)')).toBeVisible();

    // 5. Verify trust cues (SSL & WhatsApp support link)
    await expect(page.locator('text=256-bit SSL')).toBeVisible();
    await expect(page.locator('text=Support WhatsApp 24/7')).toBeVisible();

    // 6. Submit Payment & verify Full-Screen Pending State ("Validez sur votre téléphone")
    const payBtn = page.locator('button:has-text("Confirmer et Payer")');
    await payBtn.click();

    await expect(page.locator('#pending-ussd-title')).toBeVisible();
    await expect(page.locator('text=Validez sur votre téléphone')).toBeVisible();
    await expect(page.locator('text=Temps restant pour valider')).toBeVisible();
    await expect(page.locator('button:has-text("Renvoyer la demande USSD")')).toBeVisible();

    // Test Resend USSD prompt
    await page.locator('button:has-text("Renvoyer la demande USSD")').click();
    await expect(page.locator('text=Nouvelle invite USSD renvoyée avec succès !')).toBeVisible();

    // 7. Successful confirmation and offline QR ticket emission
    await expect(page.locator('text=Billet électronique émis !')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Ce billet fonctionne hors-connexion')).toBeVisible();
  });

  // Test 10: Payment by Bank Card (Visa / Mastercard) & Cash
  test('10. Checkout with Bank Card (Visa/Mastercard 3D Secure) and Cash at agency', async ({ page }) => {
    await page.goto('/bus?from=Kinshasa&to=Matadi');

    // 1. Test Card Payment Flow
    await page.locator('button:has-text("Choisir mon siège")').first().click();
    await page.locator('button:has-text("1A")').click();
    await page.locator('button:has-text("Continuer")').click();

    // Select Carte Bancaire
    const cardTab = page.locator('button:has-text("Carte Bancaire")');
    await cardTab.click();

    // Verify card fields & accepted badges
    await expect(page.locator('span:text-is("VISA")')).toBeVisible();
    await expect(page.locator('span:text-is("Mastercard")')).toBeVisible();

    // Fill card form
    await page.locator('#card-number-input').fill('4532 1234 5678 9012');
    await page.locator('#card-holder-input').fill('PATRICK MWAMBA');
    await page.locator('#card-expiry-input').fill('12/28');
    await page.locator('#card-cvv-input').fill('345');

    // Submit card payment
    const payCardBtn = page.locator('button:has-text("Confirmer et Payer")');
    await payCardBtn.click();

    // Verify 3D Secure validation pending screen
    await expect(page.locator('text=Validation 3D Secure en cours')).toBeVisible();

    // Wait for successful ticket emission
    await expect(page.locator('text=Billet électronique émis !')).toBeVisible({ timeout: 10000 });

    // 2. Test Cash Payment Flow
    await page.goto('/bus?from=Kinshasa&to=Matadi');
    await page.locator('button:has-text("Choisir mon siège")').first().click();
    await page.locator('button:has-text("1A")').click();
    await page.locator('button:has-text("Continuer")').click();

    // Select Cash
    const cashTab = page.locator('button:has-text("À l\'agence (Cash)")');
    await cashTab.click();

    await expect(page.locator('text=Paiement en espèces au guichet ou à bord')).toBeVisible();
    const payCashBtn = page.locator('button:has-text("Confirmer la réservation (Cash)")');
    await expect(payCashBtn).toBeVisible();
    await payCashBtn.click();

    // Immediately confirmed ticket voucher
    await expect(page.locator('text=Billet électronique émis !')).toBeVisible({ timeout: 10000 });
  });

  // Test 11: Scannable e-ticket pass with operator branding, boarding gate, status lifecycle and multi-channel actions
  test('11. Scannable e-ticket pass with operator branding, boarding gate, status lifecycle and multi-channel actions', async ({ page }) => {
    await page.goto('/bus?from=Kinshasa&to=Matadi');

    // Reach ticket confirmation
    await page.locator('button:has-text("Choisir mon siège")').first().click();
    await page.locator('button:has-text("1A")').click();
    await page.locator('button:has-text("Continuer")').click();
    await page.locator('button:has-text("À l\'agence (Cash)")').click();
    await page.locator('button:has-text("Confirmer la réservation (Cash)")').click();

    // 1. Verify Ticket Header & Branding
    await expect(page.locator('text=Billet électronique émis !')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Vérifié').first()).toBeVisible();
    await expect(page.locator('span:text-is("Kinshasa")').first()).toBeVisible();
    await expect(page.locator('span:text-is("Matadi")').first()).toBeVisible();

    // 2. Verify Status Indicator and Lifecycle Switching
    await expect(page.locator('span:text-is("VALIDE")')).toBeVisible();
    
    // Switch to Utilisé
    await page.locator('button:has-text("Utilisé")').click();
    await expect(page.locator('span:text-is("UTILISÉ")')).toBeVisible();

    // Switch to Expiré
    await page.locator('button:has-text("Expiré")').click();
    await expect(page.locator('span:text-is("EXPIRÉ")')).toBeVisible();

    // Switch back to Valide
    await page.locator('button:has-text("Valide")').click();
    await expect(page.locator('span:text-is("VALIDE")')).toBeVisible();

    // 3. Verify Boarding Gate & Check-in Time Information
    await expect(page.locator('text=Embarquement (Quai / Repère)')).toBeVisible();
    await expect(page.locator('text=Présentation requise 30 min avant le départ')).toBeVisible();

    // 4. Verify Seat, Passenger & Monospace Reference with Copy
    await expect(page.locator('text=N° 1A')).toBeVisible();
    await expect(page.locator('text=Patrick Mwamba')).toBeVisible();
    await expect(page.locator('button:has-text("Copier")')).toBeVisible();
    await page.locator('button:has-text("Copier")').click();
    await expect(page.locator('text=Copié !')).toBeVisible();

    // 5. Verify High-contrast QR Code & Offline Badge
    await expect(page.locator('img[alt^="Billet QR Code:"]')).toBeVisible();
    await expect(page.locator('text=Ce billet fonctionne hors-connexion')).toBeVisible();

    // 6. Verify Multi-Channel Actions
    await expect(page.locator('text=Partager sur WhatsApp')).toBeVisible();
    await expect(page.locator('text=Envoyer par SMS')).toBeVisible();
    await expect(page.locator('text=Télécharger (image/PDF)')).toBeVisible();

    // 7. Verify PWA "Ajouter à l'écran d'accueil" Modal
    const pwaBtn = page.locator('button:has-text("Écran d\'accueil")');
    await expect(pwaBtn).toBeVisible();
    await pwaBtn.click();
    await expect(page.locator('h3:has-text("Ajouter à l\'écran d\'accueil")')).toBeVisible();
    await expect(page.locator('text=Sur Android (Chrome)')).toBeVisible();
    await page.locator('button:has-text("J\'ai compris")').click();
    await expect(page.locator('h3:has-text("Ajouter à l\'écran d\'accueil")')).not.toBeVisible();

    // 8. Verify "Contacter l'opérateur" Modal
    const contactOperatorBtn = page.locator('button:has-text("Contacter l\'opérateur")');
    await expect(contactOperatorBtn).toBeVisible();
    await contactOperatorBtn.click();
    await expect(page.locator('h3:has-text("Contacter l\'opérateur")')).toBeVisible();
    await expect(page.locator('text=Appeler l\'assistance')).toBeVisible();
    await page.locator('button:has-text("Fermer")').click();
    await expect(page.locator('h3:has-text("Contacter l\'opérateur")')).not.toBeVisible();
  });

  // Test 12: Live ride 5-state flow (searching radar, offers & counter-offer, driver on way, in-progress SOS, completed rating & issue report)
  test('12. Live ride 5-state flow with bottom sheet over full-bleed map and cancel consequences', async ({ page }) => {
    await page.goto('/rides?service=taxi&pickup=Gombe+Grand+Hotel&dropoff=Aeroport+de+Ndili&proposedFare=2500000&currency=CDF');

    // 1. STATE 1: SEARCHING (Radar & Cancel Flow with free cancellation explanation)
    await expect(page.locator('text=Radar de détection actif')).toBeVisible();
    await expect(page.locator('text=Annuler la course')).toBeVisible();
    await page.locator('button:has-text("Annuler la course")').click();

    // Verify Cancel Modal explains free cancellation during search
    await expect(page.locator('h3:has-text("Annuler la demande de course")')).toBeVisible();
    await expect(page.locator('text=Annulation gratuite sans frais')).toBeVisible();
    await page.locator('button:has-text("Garder ma course")').click();
    await expect(page.locator('h3:has-text("Annuler la demande de course")')).not.toBeVisible();

    // 2. STATE 2: CHOOSING AN OFFER (Cards with Verified badge, counter-offer)
    const acceptOfferBtn = page.locator('button:has-text("Accepter cette offre")').first();
    await expect(acceptOfferBtn).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Vérifié').first()).toBeVisible();

    // Test Counter-offer negotiation
    const negotiateBtn = page.locator('button:has-text("Négocier")').first();
    await negotiateBtn.click();
    await expect(page.locator('text=Votre contre-proposition :')).toBeVisible();
    await page.locator('button:has-text("+1 000 CDF")').click();
    const sendCounterBtn = page.locator('button:has-text("Proposer")').first();
    await sendCounterBtn.click();
    await expect(page.locator('text=Contre-offre transmise').first()).toBeVisible();

    // Accept Offer
    await acceptOfferBtn.click();

    // 3. STATE 3: DRIVER ON THE WAY (Arriving ETA, Trip PIN, Call & WhatsApp, Late Cancel Warning)
    await expect(page.locator('text=Chauffeur en route vers vous')).toBeVisible();
    await expect(page.locator('text=Arrivée estimée dans 3 minutes')).toBeVisible();
    await expect(page.locator('text=Code PIN de sécurité')).toBeVisible();
    await expect(page.locator('text=Donnez ce code à votre chauffeur')).toBeVisible();
    await expect(page.locator('a:has-text("Appeler")')).toBeVisible();
    await expect(page.locator('a:has-text("WhatsApp")').first()).toBeVisible();

    // Verify Cancel Modal explains consequences when driver is already en route
    await page.locator('button:has-text("Annuler la course")').click();
    await expect(page.locator('text=Conséquences d\'une annulation tardive')).toBeVisible();
    await page.locator('button:has-text("Garder ma course")').click();

    // Advance: Start ride -> STATE 4: RIDE IN PROGRESS
    const startTripBtn = page.locator('button:has-text("Démarrer la course")');
    await startTripBtn.click();

    // 4. STATE 4: RIDE IN PROGRESS (Live route progress, Share trip, SOS)
    await expect(page.locator('text=Course en cours vers Aeroport de Ndili')).toBeVisible();
    await expect(page.locator('text=12 min restantes')).toBeVisible();
    await expect(page.locator('text=Partager le trajet sur WhatsApp')).toBeVisible();
    await expect(page.locator('text=Alerte SOS d\'urgence')).toBeVisible();

    // Trigger destination arrival -> STATE 5: COMPLETED
    const arrivalBtn = page.locator('button:has-text("Simuler Arrivée à Destination")');
    await arrivalBtn.click();

    // 5. STATE 5: COMPLETED (Fare breakdown, cash confirmation, rating & tip, report an issue)
    await expect(page.locator('text=Arrivé à destination !')).toBeVisible();
    await expect(page.locator('text=Paiement en espèces (Validé par le chauffeur)')).toBeVisible();
    await expect(page.locator('text=Total réglé :')).toBeVisible();

    // Select Tip & Submit Rating
    await page.locator('button:has-text("1 000 CDF")').click();
    await page.locator('button:has-text("Valider la note et le pourboire")').click();
    await expect(page.locator('text=Merci pour votre évaluation !')).toBeVisible();

    // Open & Submit Report Issue Modal
    const reportBtn = page.locator('button:has-text("Signaler un problème / Objet oublié")');
    await expect(reportBtn).toBeVisible();
    await reportBtn.click();
    await expect(page.locator('h3:has-text("Signaler un problème sur cette course")')).toBeVisible();
    await page.locator('button:has-text("Objet oublié à bord")').click();
    await page.locator('button:has-text("Envoyer le signalement")').click();
    await expect(page.locator('text=Signalement enregistré avec succès !')).toBeVisible();
    await page.locator('button:has-text("Fermer")').click();

    // Final action: New ride button
    await expect(page.locator('button:has-text("Commander une nouvelle course")')).toBeVisible();
  });

  test('13. Trust & Safety: Verified Badges, Refund Policy & Floating Support', async ({ page }) => {
    // 1. Visit Bus Search and check verified badge on bus card
    await page.goto('/bus?from=kinshasa&to=matadi');
    const verifiedBadge = page.locator('button:has-text("Vérifié")').first();
    await expect(verifiedBadge).toBeVisible();

    // Click verified badge to open explanation sheet
    await verifiedBadge.click();
    await expect(page.locator('text=Certification Officielle Transnumerica')).toBeVisible();
    await expect(page.locator('text=Permis d\'exploitation officiel')).toBeVisible();
    await page.locator('button:has-text("Compris, fermer")').click();

    // 2. Check Floating WhatsApp Support button
    const floatingSupport = page.locator('[data-testid="floating-whatsapp-support"]');
    await expect(floatingSupport).toBeVisible();

    // 3. Open Help Center modal from Navbar
    const helpBtn = page.locator('button[aria-label="Centre d\'aide et assistance"]');
    await helpBtn.click();
    await expect(page.locator('h2:has-text("Centre d\'Aide & Sécurité")')).toBeVisible();
    await expect(page.locator('text=WhatsApp Support')).toBeVisible();
    await expect(page.locator('text=Mon billet fonctionne-t-il sans connexion internet ?')).toBeVisible();
    await page.locator('button:has-text("Fermer le centre d\'aide")').click();

    // 4. Select seat and proceed to checkout
    const chooseSeatBtn = page.locator('button:has-text("Choisir mon siège")').first();
    await chooseSeatBtn.click();
    const seatBtn = page.locator('button:has-text("1A")');
    await seatBtn.click();
    await page.locator('button:has-text("Continuer")').click();

    // 5. Verify Refund and Cancellation Policy Summary in Checkout
    await expect(page.locator('text=Politique d\'annulation & remboursement garanti')).toBeVisible();
    await expect(page.locator('text=Annulation 100% gratuite')).toBeVisible();
    await expect(page.locator('text=Recrédit direct')).toBeVisible();
  });

  test('14. Polished Account Hub: Profile, Trip History, Re-book, Saved Places, Payments, Receipts & Mobile Tab Bar', async ({ page }) => {
    // 1. Verify Mobile Bottom Navigation tabs
    await page.goto('/');
    const bottomNav = page.locator('nav[aria-label="Navigation principale mobile"]');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.locator('span:text-is("Accueil")')).toBeVisible();
    await expect(bottomNav.locator('span:text-is("Trajets")')).toBeVisible();
    await expect(bottomNav.locator('span:text-is("Compte")')).toBeVisible();

    // 2. Click "Compte" tab to navigate to /account
    await bottomNav.locator('a[aria-label="Mon compte et profil"]').click();
    await page.waitForURL(/\/account/);

    // 3. Verify Profile and Stats
    await expect(page.locator('text=Espace Compte & Mobilité')).toBeVisible();
    await expect(page.locator('text=Passager Vérifié')).toBeVisible();
    await expect(page.locator('text=Voyages réalisés')).toBeVisible();
    await expect(page.locator('text=Économisés')).toBeVisible();

    // 4. Test Trip History & Re-book Button
    const rebookBtn = page.locator('button:has-text("Réserver à nouveau")').first();
    await expect(rebookBtn).toBeVisible();

    // Test View Receipt Modal
    const viewReceiptBtn = page.locator('button[data-testid="trip-receipt-btn"]').first();
    await viewReceiptBtn.click();
    await expect(page.locator('h2:has-text("Reçu Officiel de Paiement")')).toBeVisible();
    await expect(page.locator('text=TVA République Démocratique du Congo')).toBeVisible();
    await page.locator('button[aria-label="Fermer le reçu"]').click();

    // 5. Test Saved Places tab
    await page.locator('button:has-text("Adresses")').click();
    await expect(page.locator('text=Adresses & Lieux Fréquents')).toBeVisible();
    await expect(page.locator('span:text-is("Domicile")')).toBeVisible();
    await expect(page.locator('button:has-text("Y aller")').first()).toBeVisible();

    // 6. Test Saved Payments tab
    await page.locator('button:has-text("Paiements")').click();
    await expect(page.locator('text=Moyens de Paiement Enregistrés')).toBeVisible();
    await expect(page.getByRole('main').getByText('Vodacom M-Pesa')).toBeVisible();
    await expect(page.locator('span:text-is("Par défaut")')).toBeVisible();

    // 7. Test Receipts tab
    await page.locator('button:has-text("Reçus")').click();
    await expect(page.locator('text=Reçus & Justificatifs de Paiement')).toBeVisible();

    // 8. Test Settings tab
    await page.locator('button:has-text("Paramètres")').click();
    await expect(page.locator('text=Langue & Affichage')).toBeVisible();
    await expect(page.locator('text=Préférences de Notification')).toBeVisible();
  });

  test('15. Polished Driver Experience for One-Handed Vehicle Use: Online Toggle, Night Drive, Incoming Requests & Navigation Handoff', async ({ page }) => {
    // 1. Navigate to Driver Mode
    await page.goto('/driver');
    await expect(page.locator('h1:has-text("Dany")')).toBeVisible();
    await expect(page.locator('text=KN 1192 MT')).toBeVisible();

    // 2. High-Contrast Night Driving Mode Toggle
    const nightToggle = page.locator('button[data-testid="driver-night-mode-toggle"]');
    await expect(nightToggle).toBeVisible();
    await nightToggle.click();
    // Night mode active (text shows "Jour" or "Nuit ON")
    await expect(nightToggle).toHaveAttribute('aria-pressed', 'true');
    await nightToggle.click(); // toggle back
    await expect(nightToggle).toHaveAttribute('aria-pressed', 'false');

    // 3. Large Online / Offline Toggle
    const onlineToggle = page.locator('button[data-testid="driver-online-toggle"]');
    await expect(onlineToggle).toBeVisible();
    await expect(onlineToggle).toHaveAttribute('aria-pressed', 'true');

    // Toggle Offline
    await onlineToggle.click();
    await expect(onlineToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('text=Vous êtes actuellement hors ligne')).toBeVisible();

    // Toggle Back Online
    await onlineToggle.click();
    await expect(onlineToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('text=Demandes à Proximité')).toBeVisible();

    // 4. Incoming Request Card with Live Countdown & Landmark
    const requestCard = page.locator('article[data-testid="driver-incoming-request-card"]').first();
    await expect(requestCard).toBeVisible();
    await expect(requestCard.locator('text=Rond-point Victoire')).toBeVisible();
    await expect(requestCard.locator('text=Gare Centrale de Gombe')).toBeVisible();
    await expect(requestCard.locator('text=restantes')).toBeVisible();

    // Test Quick Counter-offer Chip
    const counterChip = requestCard.locator('button[data-testid="counter-chip-100000"]');
    await expect(counterChip).toBeVisible();

    // 5. Accept Request & Test Active Trip Flow
    const acceptBtn = requestCard.locator('button[data-testid="driver-accept-request-btn"]');
    await acceptBtn.click();

    // Active Trip View should now be visible
    const activeTrip = page.locator('div[data-testid="driver-active-trip-view"]');
    await expect(activeTrip).toBeVisible();
    await expect(activeTrip.locator('text=En route vers le passager')).toBeVisible();

    // 6. Navigation Handoff buttons (Google Maps, Waze)
    await expect(activeTrip.locator('a[data-testid="driver-nav-google-maps"]')).toBeVisible();
    await expect(activeTrip.locator('a[data-testid="driver-nav-waze"]')).toBeVisible();

    // 7. Security PIN Input with Auto-PIN button
    await activeTrip.locator('button:has-text("Auto 4821")').click();
    await activeTrip.locator('button[data-testid="driver-start-trip-btn"]').click();

    // Trip started state
    await expect(activeTrip.locator('text=Passager à bord')).toBeVisible();

    // 8. Complete Trip & Collect Fare
    const completeBtn = activeTrip.locator('button[data-testid="driver-complete-trip-btn"]');
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();

    // Trip completed: Active trip cleared, back to radar
    await expect(page.locator('div[data-testid="driver-active-trip-view"]')).not.toBeVisible();

    // 9. Earnings Summary (Today / Week) & 10% Commission Breakdown
    const earningsCard = page.locator('div[data-testid="driver-earnings-summary"]');
    await expect(earningsCard).toBeVisible();
    await expect(earningsCard.locator('text=Commission Transnumerica (10%)')).toBeVisible();
    await expect(earningsCard.locator('text=Revenu Net Chauffeur (90%)')).toBeVisible();

    // Toggle to "Cette Semaine"
    await earningsCard.locator('button[data-testid="earnings-period-week"]').click();
    await expect(earningsCard.locator('text=Gains Bruts')).toBeVisible();
    await earningsCard.locator('button[data-testid="earnings-period-today"]').click();

    // 10. Instant Mobile Money Payout Modal
    await page.locator('button[data-testid="driver-request-payout-btn"]').click();
    const payoutModal = page.locator('div[data-testid="driver-payout-modal"]');
    await expect(payoutModal).toBeVisible();
    await expect(payoutModal.locator('text=Retrait Immédiat des Gains')).toBeVisible();
    await expect(payoutModal.locator('text=Vodacom M-Pesa')).toBeVisible();

    // Confirm payout
    await payoutModal.locator('button[data-testid="confirm-driver-payout-btn"]').click();
    await expect(page.locator('text=Virement Effectué avec Succès !')).toBeVisible();
    await expect(page.locator('text=RÉFÉRENCE USSD')).toBeVisible();
    await page.locator('button:has-text("Fermer et retourner au tableau de bord")').click();
    await expect(payoutModal).not.toBeVisible();
  });

  test('16. Polished Operator & Admin Dashboard: Collapsible Sidebar, KPIs, Charts, Bookings CSV Export, KYC Document Preview, City Toggles & Dispute Resolution', async ({ page }) => {
    // 0. Authenticate as Admin with 2FA
    await page.goto('/admin/login');
    await page.fill('#admin-identifier', 'superadmin@transnumerica.cd');
    await page.fill('#admin-password', 'Transnumerica@RDC2026!');
    await page.click('button[type="submit"]');
    await page.waitForSelector('#admin-totp');
    await page.fill('#admin-totp', '123456');
    await page.click('button:has-text("Valider & Accéder")');
    await page.waitForURL('**/admin');

    // 1. Verify /admin Dashboard
    await expect(page.locator('h1:has-text("Superviseur Mobilité RDC")')).toBeVisible();

    // 2. Verify KPI Cards
    await expect(page.locator('div[data-testid="kpi-card-bookings"]')).toBeVisible();
    await expect(page.locator('div[data-testid="kpi-card-revenue"]')).toBeVisible();
    await expect(page.locator('div[data-testid="kpi-card-occupancy"]')).toBeVisible();
    await expect(page.locator('div[data-testid="kpi-card-active_rides"]')).toBeVisible();

    // Refresh KPI metrics
    await page.locator('button[data-testid="admin-refresh-kpis"]').click();

    // 3. Verify Accessible Charts Section
    await expect(page.locator('div[data-testid="admin-charts-section"]')).toBeVisible();
    await expect(page.locator('text=Évolution des Recettes & Réservations')).toBeVisible();
    await expect(page.locator('text=Répartition par Mode')).toBeVisible();

    // 4. Test Bookings Table & CSV Export Button
    await expect(page.locator('div[data-testid="admin-bookings-table-section"]')).toBeVisible();
    await expect(page.locator('button[data-testid="export-csv-btn"]')).toBeVisible();
    await expect(page.locator('text=TN-BUS-849204')).toBeVisible();

    // Filter by Service (BUS)
    await page.locator('div[data-testid="admin-bookings-table-section"]').locator('button:has-text("BUS")').click();
    await expect(page.locator('text=TN-BUS-849204')).toBeVisible();

    // Helper to navigate tabs via mobile drawer or desktop sidebar
    const navigateToTab = async (tabId: string) => {
      const mobileBtn = page.locator('button[data-testid="admin-mobile-menu-btn"]');
      if (await mobileBtn.isVisible()) {
        await mobileBtn.click();
      }
      await page.locator(`button[data-testid="admin-nav-${tabId}"]`).click();
    };

    // 5. Navigate to Verification Queue tab
    await navigateToTab('verification');
    await expect(page.locator('div[data-testid="admin-verification-queue-section"]')).toBeVisible();
    await expect(page.locator('text=Honoré Kabeya')).toBeVisible();

    // Open Document Preview Modal
    const previewBtn = page.locator('button[data-testid="preview-docs-btn-kyc-1"]');
    await previewBtn.click();
    const docModal = page.locator('div[data-testid="admin-document-preview-modal"]');
    await expect(docModal).toBeVisible();
    await expect(docModal.locator('text=RÉPUBLIQUE DÉMOCRATIQUE DU CONGO')).toBeVisible();
    await expect(docModal.locator('text=Contrôles réglementaires obligatoires RDC')).toBeVisible();

    // Approve Candidate in Modal
    await docModal.locator('button[data-testid="modal-approve-kyc-btn"]').click();
    await expect(docModal).not.toBeVisible();

    // 6. Navigate to City & Service Toggles tab
    await navigateToTab('city_services');
    await expect(page.locator('div[data-testid="admin-city-services-section"]')).toBeVisible();
    await expect(page.locator('div[data-testid="admin-audit-trail-section"]')).toBeVisible();

    // 7. Navigate to Dispute Management tab
    await navigateToTab('disputes');
    await expect(page.locator('div[data-testid="admin-disputes-section"]')).toBeVisible();
    await expect(page.locator('text=DISP-2026-0849')).toBeVisible();

    // Refund passenger via Mobile Money
    const refundBtn = page.locator('button[data-testid="refund-dispute-btn-disp-1"]');
    await refundBtn.click();
    await expect(page.locator('div[data-testid="dispute-card-disp-1"]').locator('text=Dossier résolu')).toBeVisible();

    // 8. Navigate to Audit Log tab
    await navigateToTab('audit_log');
    await expect(page.locator('div[data-testid="admin-full-audit-log-page"]')).toBeVisible();
    await expect(page.locator('text=Admin_Kasavubu').first()).toBeVisible();
  });
});




