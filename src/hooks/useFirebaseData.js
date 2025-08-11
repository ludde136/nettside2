import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const useFirebaseData = () => {
  const [data, setData] = useState({
    hytter: [],
    hero: {},
    omOss: {},
    kontakt: {},
    footer: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Hent hytter
        const hytterSnapshot = await getDocs(collection(db, "hytter"));
        const hytter = hytterSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Hent innholdsdata
        const innholdSnapshot = await getDocs(collection(db, "innhold"));
        const innhold = {};
        innholdSnapshot.docs.forEach((doc) => {
          innhold[doc.id] = doc.data();
        });

        setData({
          hytter,
          hero: innhold.hero || {},
          omOss: innhold.omOss || {},
          kontakt: innhold.kontakt || {},
          footer: innhold.footer || {},
        });
      } catch (err) {
        console.error("Feil ved henting av data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
