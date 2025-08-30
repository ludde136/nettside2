import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function Contact({ kontakt = {} }) {
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

  return (
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
                  <a
                    href={`mailto:${kontakt.epost || "ludde1910@hotmail.com"}`}
                    className="kontakt-lenke"
                    title="Send e-post"
                  >
                    {kontakt.epost || "ludde1910@hotmail.com"}
                  </a>
                </div>
              </div>

              <div className="kontakt-item">
                <span className="kontakt-ikon">📱</span>
                <div>
                  <h4>Mobil</h4>
                  <a
                    href={`tel:${kontakt.mobil || "90150051"}`}
                    className="kontakt-lenke"
                    title="Ring oss"
                  >
                    {kontakt.mobil || "90150051"}
                  </a>
                </div>
              </div>

              <div className="kontakt-item">
                <span className="kontakt-ikon">🌐</span>
                <div>
                  <h4>Nettside</h4>
                  <a
                    href={`https://${kontakt.nettside || "www.hyttegjest.no"}`}
                    className="kontakt-lenke"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Besøk nettsiden"
                  >
                    {kontakt.nettside || "www.hyttegjest.no"}
                  </a>
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
  );
}

export default Contact;
