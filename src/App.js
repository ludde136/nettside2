import "./App.css";
import { useFirebaseData } from "./hooks/useFirebaseData";
import { useState, useEffect } from "react";
import Contact from "./components/Contact";
import InfoPopup from "./components/InfoPopup";
import {
  doc,
  setDoc,
  getDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const { data, loading, error } = useFirebaseData();
  const {
    hytter = [],
    hero = {},
    omOss = {},
    kontakt = {},
    footer = {},
  } = data;

  // State for besøkstall
  const [besokTall, setBesokTall] = useState(0);

  // State for hamburger meny
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

  // State for hvilken visning som skal vises
  const [currentView, setCurrentView] = useState("main"); // 'main' eller 'hytteutleier'

  // State for info popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentHytte, setCurrentHytte] = useState("");

  // Smooth scroll funksjon
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Håndter hamburger meny toggle
  const toggleHamburgerMenu = () => {
    setIsHamburgerMenuOpen(!isHamburgerMenuOpen);
  };

  // Lukk dropdown meny når man klikker utenfor
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isHamburgerMenuOpen &&
        !event.target.closest(".hamburger-menu-btn") &&
        !event.target.closest(".hamburger-dropdown")
      ) {
        setIsHamburgerMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHamburgerMenuOpen]);

  // Lukk hamburger meny når man bytter visning
  const handleViewChange = (newView) => {
    setIsHamburgerMenuOpen(false);
    setCurrentView(newView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Håndter popup
  const openPopup = (hytteNavn) => {
    setCurrentHytte(hytteNavn);
    setIsPopupOpen(true);
  };
  const closePopup = () => setIsPopupOpen(false);

  // Registrer besøk
  const registrerBesok = async () => {
    const besokKey = `besok_${new Date().toDateString()}`;
    const harBesokt = localStorage.getItem(besokKey);

    if (!harBesokt) {
      try {
        // Oppdater besøkstall i Firestore
        const besokRef = doc(db, "statistikk", "besok");
        await setDoc(
          besokRef,
          {
            total: increment(1),
            sistOppdatert: serverTimestamp(),
          },
          { merge: true }
        );

        // Marker at denne brukeren har besøkt i dag
        localStorage.setItem(besokKey, "true");

        // Hent oppdatert tall
        const docSnap = await getDoc(besokRef);
        if (docSnap.exists()) {
          setBesokTall(docSnap.data().total || 0);
        }
      } catch (error) {
        console.error("Feil ved registrering av besøk:", error);
      }
    }
  };

  // Hent besøkstall ved lasting
  const hentBesokTall = async () => {
    try {
      const besokRef = doc(db, "statistikk", "besok");
      const docSnap = await getDoc(besokRef);
      if (docSnap.exists()) {
        setBesokTall(docSnap.data().total || 0);
      }
    } catch (error) {
      console.error("Feil ved henting av besøkstall:", error);
    }
  };

  // Registrer besøk og hent tall når komponenten lastes
  useEffect(() => {
    hentBesokTall();

    // Bruk en global variabel for å unngå dobbeltregistrering
    if (!window.besokRegistrert) {
      window.besokRegistrert = true;
      registrerBesok();
    }
  }, []);

  if (loading) {
    return (
      <div className="App" id="top">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Laster inn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App" id="top">
        <div className="error">
          <h2>Feil ved lasting av data</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App" id="top">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          {/* Hamburger meny knapp */}
          <button
            className="hamburger-menu-btn"
            onClick={toggleHamburgerMenu}
            aria-label="Åpne/lukk meny"
          >
            <span
              className={`hamburger-line ${isHamburgerMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`hamburger-line ${isHamburgerMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`hamburger-line ${isHamburgerMenuOpen ? "open" : ""}`}
            ></span>
          </button>

          {/* Hamburger dropdown meny */}
          {isHamburgerMenuOpen && (
            <div className="hamburger-dropdown">
              <button
                className={`dropdown-item ${
                  currentView === "main" ? "active" : ""
                }`}
                onClick={() => handleViewChange("main")}
              >
                Hovedside
              </button>
              <button
                className={`dropdown-item ${
                  currentView === "hytteutleier" ? "active" : ""
                }`}
                onClick={() => handleViewChange("hytteutleier")}
              >
                Bli hytteutleier
              </button>
            </div>
          )}

          <h1 className="logo">hyttegjest.no</h1>
          {currentView === "main" && (
            <nav className="nav">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="nav-link"
              >
                Hjem
              </button>
              <button
                onClick={() => scrollToSection("hytter")}
                className="nav-link"
              >
                Hytter
              </button>
              <button
                onClick={() => scrollToSection("om-oss")}
                className="nav-link"
              >
                Om oss
              </button>
              <button
                onClick={() => scrollToSection("kontakt")}
                className="nav-link"
              >
                Kontakt
              </button>
              <button
                onClick={() => handleViewChange("hytteutleier")}
                className="nav-link cta-nav"
              >
                Bli hytteutleier
              </button>
            </nav>
          )}
        </div>
      </header>
      {currentView === "main" ? (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content">
              <h1 className="hero-title">
                {hero.title || "Opplev Norges hyggeligste hytter"}
              </h1>
              <p className="hero-subtitle">
                {hero.subtitle ||
                  "Bok din drømmehytte i hjertet av norsk natur"}
              </p>
              <button
                onClick={() => scrollToSection("hytter")}
                className="cta-button"
              >
                {hero.buttonText || "Se tilgjengelige hytter"}
              </button>
            </div>
          </section>
          {/* Hytter Section */}
          <section className="hytter-section" id="hytter">
            <div className="container">
              <h2 className="section-title">
                {omOss.hytterTitle || "Våre hytter"}
              </h2>
              <p className="section-subtitle">
                {omOss.hytterSubtitle ||
                  "Velg blant våre utvalgte hytter for din perfekte ferie"}
              </p>

              <div className="hytter-grid">
                {hytter
                  .sort((a, b) => {
                    // Plasser Trulsrudkollen først (venstre side)
                    if (a.navn === "Markahytte Trulsrudkollen") return -1;
                    if (b.navn === "Markahytte Trulsrudkollen") return 1;
                    return 0;
                  })
                  .map((hytte) => (
                    <div key={hytte.id} className="hytte-kort">
                      <div className="hytte-bilde">
                        {hytte.navn === "Markahytte Trulsrudkollen" ? (
                          <a
                            href="https://www.inatur.no/hytte/61a68c0295acd111a0c39397/en-perle-av-en-markahytte-i-lommedalen-med-panoramautsikt-til-oslofjorden-anneks-kan-ogsa-leies"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hytte-bilde-lenke"
                          >
                            <img
                              src="/Skjermbilde 2025-08-12 213230.png"
                              alt={hytte.navn}
                            />
                            <div className="hytte-pris">fra {hytte.pris}</div>
                          </a>
                        ) : (
                          <>
                            {hytte.navn === "Hytteidyll Krokkleiva" ? (
                              <a
                                href="https://www.inatur.no/hytte/6799e72383987e2943e9474c/hytteidyll-pa-krokkleiva-original-tommerhytte-med-fredelig-beliggenhet-midt-i-naturen"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hytte-bilde-lenke"
                              >
                                <img src={hytte.bilde} alt={hytte.navn} />
                                <div className="hytte-pris">
                                  fra {hytte.pris}
                                </div>
                              </a>
                            ) : (
                              <>
                                <img src={hytte.bilde} alt={hytte.navn} />
                                <div className="hytte-pris">
                                  fra {hytte.pris}
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                      <div className="hytte-info">
                        <h3 className="hytte-navn">{hytte.navn}</h3>
                        <p className="hytte-kort-beskrivelse">
                          {hytte.kortBeskrivelse}
                        </p>
                        <p className="hytte-beskrivelse">{hytte.beskrivelse}</p>
                        <div className="hytte-detaljer">
                          <span
                            className="kapasitet clickable"
                            onClick={() => openPopup(hytte.navn)}
                            title="Klikk for mer info"
                          >
                            👥 {hytte.kapasitet}
                          </span>

                          {/* Instagram-ikon for Markahytte Trulsrudkollen - på samme linje som kapasitet */}
                          {hytte.navn === "Markahytte Trulsrudkollen" && (
                            <a
                              href="https://www.instagram.com/trulsrudkollen"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="instagram-link"
                              title="Følg oss på Instagram"
                            >
                              <svg
                                className="instagram-icon"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                width="20"
                                height="20"
                              >
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                              Instagram
                            </a>
                          )}
                        </div>

                        {hytte.navn === "Markahytte Trulsrudkollen" ? (
                          <a
                            href="https://www.inatur.no/hytte/61a68c0295acd111a0c39397/en-perle-av-en-markahytte-i-lommedalen-med-panoramautsikt-til-oslofjorden-anneks-kan-ogsa-leies"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="book-button-link"
                          >
                            Les mer & Book
                          </a>
                        ) : hytte.navn === "Hytteidyll Krokkleiva" ? (
                          <a
                            href="https://www.inatur.no/hytte/6799e72383987e2943e9474c/hytteidyll-pa-krokkleiva-original-tommerhytte-med-fredelig-beliggenhet-midt-i-naturen"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="book-button-link"
                          >
                            Les mer & Book
                          </a>
                        ) : (
                          <button className="book-button">
                            Les mer & Book
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
          {/* Om oss Section */}
          <section className="om-oss-section" id="om-oss">
            <div className="container">
              <h2 className="section-title">{omOss.title || "Om oss"}</h2>
              <div className="om-oss-content">
                <div className="om-oss-text">
                  <h3>{omOss.historieTitle || "Vår historie"}</h3>
                  <p>
                    {omOss.historie1 ||
                      "hyttegjest.no ble grunnlagt med en enkel visjon: å gjøre det enkelt for folk å oppleve Norges vakre natur ved å tilby kvalitetshytter på strategiske steder."}
                  </p>
                  <p>
                    {omOss.historie2 ||
                      "Vi har en liten samling av de fineste hyttene, fra koselige markahytter til tømmerhytter, og de er valgt ut med omhu for å sikre at våre gjester får den beste opplevelsen."}
                  </p>

                  <h3>{omOss.verdierTitle || "Våre verdier"}</h3>
                  <ul className="verdier-liste">
                    {omOss.verdier ? (
                      omOss.verdier.map((verdi, index) => (
                        <li key={index}>{verdi}</li>
                      ))
                    ) : (
                      <>
                        <li>✨ Kvalitet i alt vi gjør</li>
                        <li>🌿 Bærekraftig turisme</li>
                        <li>🤝 Personlig kundeservice</li>
                        <li>🏔️ Respekt for naturen</li>
                        <li>💯 Ærlighet og åpenhet</li>
                      </>
                    )}
                  </ul>

                  <h3>{omOss.hvorforTitle || "Hvorfor velge oss?"}</h3>
                  <p>
                    {omOss.hvorforTekst ||
                      "Med erfaring i hytteutleie kan vi garantere at du får en uforglemmelig opplevelse. Vi er her for å hjelpe deg med å finne en hytte som passer deg og sikre at oppholdet blir alt du håper på."}
                  </p>
                </div>
                <div className="om-oss-bilde">
                  <img
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=400&fit=crop"
                    alt="Norsk skog og natur"
                  />
                </div>
              </div>
            </div>
          </section>
          {/* Kontakt Section */}
          <Contact kontakt={kontakt} />
        </>
      ) : (
        <>
          {/* Bli hytteutleier Section */}
          <section className="bli-hytteutleier-section" id="bli-hytteutleier">
            <div className="container">
              <div className="bli-hytteutleier-header">
                <button
                  onClick={() => handleViewChange("main")}
                  className="tilbake-knapp"
                >
                  ← Tilbake til hovedside
                </button>
                <h2 className="section-title">Bli hytteutleier</h2>
              </div>
              <div className="bli-hytteutleier-content">
                <div className="bli-hytteutleier-text">
                  <h3>Gjør din hytte til en inntektskilde</h3>
                  <p>
                    Har du en hytte som står tom mesteparten av året? La oss
                    hjelpe deg med å gjøre den til en lukrativ inntektskilde! Vi
                    tar oss av alt det driftsrelaterte arbeidet, så du kan
                    fokusere på det som betyr mest.
                  </p>

                  <h3>Hva vi tilbyr</h3>
                  <div className="tjenester-grid">
                    <div className="tjeneste-kort">
                      <div className="tjeneste-ikon">🏠</div>
                      <h4>Komplett hytteforberedelse</h4>
                      <p>
                        Vi gjør hytta utleieklar med alt fra rengjøring til
                        sengeklær
                      </p>
                    </div>
                    <div className="tjeneste-kort">
                      <div className="tjeneste-ikon">📱</div>
                      <h4>Booking og administrasjon</h4>
                      <p>Vi håndterer alle reservasjoner og kundekontakter</p>
                    </div>
                    <div className="tjeneste-kort">
                      <div className="tjeneste-ikon">💰</div>
                      <h4>Optimal prissetting</h4>
                      <p>
                        Vi setter konkurransedyktige priser basert på markedet
                      </p>
                    </div>
                    <div className="tjeneste-kort">
                      <div className="tjeneste-ikon">📸</div>
                      <h4>Profesjonell markedsføring</h4>
                      <p>
                        Vi fotograferer og markedsfører hytta på våre
                        plattformer
                      </p>
                    </div>
                  </div>

                  <h3>Hvorfor velge oss?</h3>
                  <ul className="fordeler-liste">
                    <li>
                      ✅ <strong>Ingen startkostnader</strong> - vi tar kun en
                      prosentandel av inntektene
                    </li>
                    <li>
                      ✅ <strong>Komplett service</strong> - du trenger ikke
                      gjøre noe
                    </li>
                    <li>
                      ✅ <strong>Høy inntekt</strong> - vi maksimaliserer
                      utleiepotensialet
                    </li>
                    <li>
                      ✅ <strong>Pålitelig drift</strong> - 24/7 kundeservice og
                      support
                    </li>
                    <li>
                      ✅ <strong>Fleksibilitet</strong> - du bestemmer når hytta
                      skal være tilgjengelig
                    </li>
                  </ul>

                  <h3>Hvordan det fungerer</h3>
                  <div className="prosess-steg">
                    <div className="steg">
                      <div className="steg-nummer">1</div>
                      <h4>Kontakt oss</h4>
                      <p>
                        Ta kontakt for en uforpliktende samtale om din hytte
                      </p>
                    </div>
                    <div className="steg">
                      <div className="steg-nummer">2</div>
                      <h4>Vurdering</h4>
                      <p>Vi vurderer hyttas potensial og setter opp en plan</p>
                    </div>
                    <div className="steg">
                      <div className="steg-nummer">3</div>
                      <h4>Oppstart</h4>
                      <p>Vi gjør hytta utleieklar og starter markedsføringen</p>
                    </div>
                    <div className="steg">
                      <div className="steg-nummer">4</div>
                      <h4>Utleie</h4>
                      <p>Din hytte blir leid ut og du får inntekter</p>
                    </div>
                  </div>

                  <div className="cta-seksjon">
                    <h3>Klar til å starte?</h3>
                    <p>
                      Ta kontakt med oss i dag for å høre mer om hvordan vi kan
                      hjelpe deg med å gjøre din hytte til en suksessfull
                      utleieeiendom.
                    </p>
                    <button
                      onClick={() => scrollToSection("kontakt")}
                      className="cta-button"
                    >
                      Ta kontakt nå
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Kontakt Section */}
          <Contact kontakt={kontakt} />
        </>
      )}

      {/* Info Popup */}
      <InfoPopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        title="Kapasitet & Soveplasser"
        content={
          <div>
            {currentHytte === "Markahytte Trulsrudkollen" ? (
              <p>
                Legg til annekset som tillegsbestilling og få utvidet
                kapasiteten med 4 personer ekstra. Dette tilsvarer mulighet til
                å huse inntil ca 8 personer (9 personer med skuvsengen, for de
                minste 😊).
              </p>
            ) : currentHytte === "Hytteidyll Krokkleiva" ? (
              <p>
                Dobbeltseng og 2 feltsenger, ta med egen dyne eller sovepose
                dersom feltsenger benyttes.
              </p>
            ) : (
              <p>
                Kontakt oss for mer informasjon om soveplasser og kapasitet.
              </p>
            )}
          </div>
        }
      />

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>{footer.logo || "hyttegjest.no"}</h3>
              <p>
                {footer.beskrivelse ||
                  "Din pålitelige partner for hytteutleie i Norge"}
              </p>
            </div>
            <div className="footer-section">
              <h4>{footer.kontaktTitle || "Kontakt"}</h4>
              <p>
                📧{" "}
                <a
                  href={`mailto:${footer.epost || "ludde1910@hotmail.com"}`}
                  className="footer-kontakt-lenke"
                  title="Send e-post"
                >
                  {footer.epost || "ludde1910@hotmail.com"}
                </a>
              </p>
              <p>
                📞{" "}
                <a
                  href={`tel:${footer.mobil || "90150051"}`}
                  className="footer-kontakt-lenke"
                  title="Ring oss"
                >
                  {footer.mobil || "90150051"}
                </a>
              </p>
            </div>
            <div className="footer-section">
              <h4>{footer.socialTitle || "Følg oss"}</h4>
              <div className="social-links">
                <a
                  href="https://www.instagram.com/trulsrudkollen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instagram-link-footer"
                  title="Følg oss på Instagram"
                >
                  <svg
                    className="instagram-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="20"
                    height="20"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              {footer.copyright ||
                "&copy; 2024 hyttegjest.no. Alle rettigheter forbeholdt."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
