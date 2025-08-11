import "./App.css";
import { useFirebaseData } from "./hooks/useFirebaseData";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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

  // State for kontakt-skjemaet
  const [formData, setFormData] = useState({
    navn: "",
    epost: "",
    telefon: "",
    emne: "",
    melding: "",
  });
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
  });

  // Håndter input-endringer
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Håndter skjema-submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ submitting: true, submitted: false, error: null });

    try {
      // Lagre til Firestore
      await addDoc(collection(db, "kontakt-meldinger"), {
        ...formData,
        timestamp: serverTimestamp(),
        status: "ny",
      });

      // Reset skjemaet og vis suksess
      setFormData({
        navn: "",
        epost: "",
        telefon: "",
        emne: "",
        melding: "",
      });
      setFormStatus({ submitting: false, submitted: true, error: null });

      // Reset suksess-melding etter 5 sekunder
      setTimeout(() => {
        setFormStatus((prev) => ({ ...prev, submitted: false }));
      }, 5000);
    } catch (error) {
      console.error("Feil ved sending av melding:", error);
      setFormStatus({
        submitting: false,
        submitted: false,
        error: "Kunne ikke sende melding. Prøv igjen senere.",
      });
    }
  };

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
          <h1 className="logo">hyttegjest.no</h1>
          <nav className="nav">
            <a href="#top" className="nav-link">
              Hjem
            </a>
            <a href="#hytter" className="nav-link">
              Hytter
            </a>
            <a href="#om-oss" className="nav-link">
              Om oss
            </a>
            <a href="#kontakt" className="nav-link">
              Kontakt
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            {hero.title || "Opplev Norges hyggeligste hytter"}
          </h1>
          <p className="hero-subtitle">
            {hero.subtitle || "Bok din drømmehytte i hjertet av norsk natur"}
          </p>
          <a href="#hytter" className="cta-button">
            {hero.buttonText || "Se tilgjengelige hytter"}
          </a>
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
                        href="https://trulsrudkollen.no"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hytte-bilde-lenke"
                      >
                        <img src={hytte.bilde} alt={hytte.navn} />
                        <div className="hytte-pris">{hytte.pris}</div>
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
                            <div className="hytte-pris">{hytte.pris}</div>
                          </a>
                        ) : (
                          <>
                            <img src={hytte.bilde} alt={hytte.navn} />
                            <div className="hytte-pris">{hytte.pris}</div>
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
                      <span className="kapasitet">👥 {hytte.kapasitet}</span>
                    </div>
                    {hytte.navn === "Markahytte Trulsrudkollen" ? (
                      <a
                        href="https://trulsrudkollen.no"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="book-button-link"
                      >
                        Book nå
                      </a>
                    ) : hytte.navn === "Hytteidyll Krokkleiva" ? (
                      <a
                        href="https://www.inatur.no/hytte/6799e72383987e2943e9474c/hytteidyll-pa-krokkleiva-original-tommerhytte-med-fredelig-beliggenhet-midt-i-naturen"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="book-button-link"
                      >
                        Book nå
                      </a>
                    ) : (
                      <button className="book-button">Book nå</button>
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
                  "hyttegjest.no ble grunnlagt med en enkel visjon: å gjøre det enkelt for folk å oppleve Norges vakre natur ved å tilby kvalitetshytter på strategiske steder rundt om i landet."}
              </p>
              <p>
                {omOss.historie2 ||
                  "Vi har samlet et utvalg av de fineste hyttene, fra koselige markahytter til tømmerhytter, alle valgt ut med omhu for å sikre at våre gjester får den beste opplevelsen."}
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
                  "Med årevis av erfaring i hytteutleie og et stort nettverk av pålitelige hytteeiere, kan vi garantere at du får en uforglemmelig opplevelse. Vi er her for å hjelpe deg med å finne en hytte som passer deg og sikre at oppholdet blir alt du håper på."}
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
      <section className="kontakt-section" id="kontakt">
        <div className="container">
          <h2 className="section-title">{kontakt.title || "Kontakt oss"}</h2>
          <div className="kontakt-content">
            <div className="kontakt-info">
              <h3>{kontakt.undertittel || "Ta kontakt"}</h3>
              <p>
                {kontakt.beskrivelse ||
                  "Vi er her for å hjelpe deg med å finne en hytte som passer deg!"}
              </p>

              <div className="kontakt-detaljer">
                <div className="kontakt-item">
                  <span className="kontakt-ikon">📧</span>
                  <div>
                    <h4>E-post</h4>
                    <p>{kontakt.epost || "ludde1910@hotmail.com"}</p>
                  </div>
                </div>

                <div className="kontakt-item">
                  <span className="kontakt-ikon">📱</span>
                  <div>
                    <h4>Mobil</h4>
                    <p>{kontakt.mobil || "90150051"}</p>
                  </div>
                </div>

                <div className="kontakt-item">
                  <span className="kontakt-ikon">🌐</span>
                  <div>
                    <h4>Nettside</h4>
                    <p>{kontakt.nettside || "www.hyttegjest.no"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="kontakt-skjema">
              <h3>Send oss en melding</h3>

              {/* Status-meldinger */}
              {formStatus.submitted && (
                <div className="success-message">
                  <p>🎉 Takk for din melding! Vi tar kontakt snart.</p>
                </div>
              )}

              {formStatus.error && (
                <div className="error-message">
                  <p>❌ {formStatus.error}</p>
                </div>
              )}

              <form className="kontakt-form" onSubmit={handleSubmit}>
                <div className="form-gruppe">
                  <label htmlFor="navn">Navn *</label>
                  <input
                    type="text"
                    id="navn"
                    name="navn"
                    value={formData.navn}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-gruppe">
                  <label htmlFor="epost">E-post *</label>
                  <input
                    type="email"
                    id="epost"
                    name="epost"
                    value={formData.epost}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-gruppe">
                  <label htmlFor="telefon">Telefon</label>
                  <input
                    type="tel"
                    id="telefon"
                    name="telefon"
                    value={formData.telefon}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-gruppe">
                  <label htmlFor="emne">Emne *</label>
                  <select
                    id="emne"
                    name="emne"
                    value={formData.emne}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Velg emne</option>
                    <option value="booking">Booking og reservasjon</option>
                    <option value="spørsmål">Generelle spørsmål</option>
                    <option value="tilbakemelding">Tilbakemelding</option>
                    <option value="samarbeid">Samarbeid</option>
                    <option value="annet">Annet</option>
                  </select>
                </div>

                <div className="form-gruppe">
                  <label htmlFor="melding">Melding *</label>
                  <textarea
                    id="melding"
                    name="melding"
                    rows="5"
                    value={formData.melding}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="send-button"
                  disabled={formStatus.submitting}
                >
                  {formStatus.submitting ? "Sender..." : "Send melding"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

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
              <p>📧 {footer.epost || "ludde1910@hotmail.com"}</p>
              <p>📞 {footer.mobil || "90150051"}</p>
            </div>
            <div className="footer-section">
              <h4>{footer.socialTitle || "Følg oss"}</h4>
              <div className="social-links">
                {footer.socialLinks ? (
                  footer.socialLinks.map((link, index) => (
                    <a key={index} href={link.url} className="social-link">
                      {link.navn}
                    </a>
                  ))
                ) : (
                  <>
                    <a href="#" className="social-link">
                      Facebook
                    </a>
                    <a href="#" className="social-link">
                      Instagram
                    </a>
                    <a href="#" className="social-link">
                      Twitter
                    </a>
                  </>
                )}
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
