import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  CheckCircle,
  Info,
  Phone,
  Email,
  LocationOn,
  Warning,
  Home,
  Fireplace,
  WaterDrop,
  Lightbulb,
  LocalFireDepartment as FireExtinguisher,
  LocalDining,
  OutdoorGrill,
  Storage,
  Instagram as InstagramIcon,
} from "@mui/icons-material";
import { translations } from "./Trulsrudkollen";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// TabPanel komponent
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hytte-tabpanel-${index}`}
      aria-labelledby={`hytte-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Gjenbrukbar kontaktinformasjon komponent
function ContactInfo({ t }) {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 4,
        marginBottom: 4,
        borderRadius: 3,
        background: "rgba(255, 255, 255, 0.95)",
        border: "2px solid rgba(74, 124, 89, 0.2)",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          marginBottom: 3,
          color: "#2d5016",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Phone sx={{ color: "#4a7c59" }} />
        {t.contact.title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: "#4a7c59", marginBottom: 2 }}>
            {t.contact.duringStay.title}
          </Typography>
          <List dense>
            <ListItem
              component="a"
              href={`tel:${t.contact.duringStay.phone.primary.replace(
                "Telefon: ",
                ""
              )}`}
              sx={{
                textDecoration: "none",
                color: "inherit",
                "&:hover": {
                  backgroundColor: "rgba(74, 124, 89, 0.1)",
                  borderRadius: 1,
                },
              }}
            >
              <ListItemIcon>
                <Phone sx={{ color: "#4a7c59" }} />
              </ListItemIcon>
              <ListItemText
                primary={t.contact.duringStay.phone.primary}
                secondary={t.contact.duringStay.phone.secondary}
              />
            </ListItem>
            <ListItem
              component="a"
              href={`mailto:${t.contact.duringStay.email.primary.replace(
                "E-post: ",
                ""
              )}`}
              sx={{
                textDecoration: "none",
                color: "inherit",
                "&:hover": {
                  backgroundColor: "rgba(74, 124, 89, 0.1)",
                  borderRadius: 1,
                },
              }}
            >
              <ListItemIcon>
                <Email sx={{ color: "#4a7c59" }} />
              </ListItemIcon>
              <ListItemText
                primary={t.contact.duringStay.email.primary}
                secondary={t.contact.duringStay.email.secondary}
              />
            </ListItem>
          </List>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: "#4a7c59", marginBottom: 2 }}>
            {t.contact.emergency.title}
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Info sx={{ color: "#dc2626" }} />
              </ListItemIcon>
              <ListItemText
                primary={t.contact.emergency.emergency.primary}
                secondary={t.contact.emergency.emergency.secondary}
              />
            </ListItem>
            <ListItem
              component="a"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.open(
                  "https://maps.google.com/?q=Bærum+sykehus,+Norge",
                  "_blank"
                );
              }}
              sx={{
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(74, 124, 89, 0.1)",
                  borderRadius: 1,
                },
              }}
            >
              <ListItemIcon>
                <LocationOn sx={{ color: "#4a7c59" }} />
              </ListItemIcon>
              <ListItemText
                primary={t.contact.emergency.hospital.primary}
                secondary={t.contact.emergency.hospital.secondary}
              />
            </ListItem>
          </List>
        </Box>
      </Box>
    </Paper>
  );
}

function ForHyttegjester() {
  const [language, setLanguage] = useState("no");
  const t = translations[language];

  // Fane state
  const [activeTab, setActiveTab] = useState(0);

  // Tilbakemeldingsskjema state
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    stayPeriod: "",
    rating: 0,
    feedback: "",
    category: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleLanguageChange = () => {
    setLanguage(language === "no" ? "en" : "no");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFeedbackChange = (field, value) => {
    setFeedbackForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Opprett feedback-objekt med timestamp
      const feedbackData = {
        ...feedbackForm,
        timestamp: serverTimestamp(),
        language: language,
        createdAt: new Date().toISOString(),
      };

      // Push feedback til Firebase database
      const docRef = await addDoc(collection(db, "feedback"), feedbackData);

      // Vis suksessmelding
      setSnackbar({
        open: true,
        message: t.feedback.form.success,
        severity: "success",
      });

      // Reset skjemaet
      setFeedbackForm({
        name: "",
        email: "",
        stayPeriod: "",
        rating: 0,
        feedback: "",
        category: "general",
      });

      console.log("Feedback lagt til med ID:", docRef.id);
    } catch (error) {
      console.error("Feil ved sending av feedback:", error);

      // Vis feilmelding
      setSnackbar({
        open: true,
        message: t.feedback.form.error,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 4 },
        maxWidth: "1200px",
        margin: "0 auto",
        paddingTop: "80px", // Plass til header
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(226, 232, 240, 0.6) 100%)",
      }}
    >
      {/* Språkswitch */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 2,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={language === "en"}
              onChange={handleLanguageChange}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#4a7c59",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#4a7c59",
                },
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{
                color: "#4a7c59",
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              {language === "no" ? "🇳🇴 Norsk" : "🇬🇧 English"}
            </Typography>
          }
          labelPlacement="start"
        />
      </Box>

      {/* Hovedtittel */}
      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          marginBottom: 2,
          color: "#2d5016",
          fontWeight: 700,
          fontSize: { xs: "2rem", sm: "3rem" },
          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {t.title}
      </Typography>

      {/* Fane-navigasjon */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", marginBottom: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="hytte-informasjon faner"
          sx={{
            "& .MuiTab-root": {
              color: "#4a7c59",
              fontWeight: 500,
              fontSize: "1.1rem",
              textTransform: "none",
              minHeight: "48px",
            },
            "& .Mui-selected": {
              color: "#2d5016",
              fontWeight: 600,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#4a7c59",
              height: "3px",
            },
          }}
        >
          <Tab label={t.tabs.info} />
          <Tab label={t.tabs.hiking} />
          <Tab label={t.tabs.feedback} />
        </Tabs>
      </Box>

      {/* TabPanel for hytteinformasjon */}
      <TabPanel value={activeTab} index={0}>
        {/* Velkommen seksjon */}
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            marginBottom: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            border: "2px solid rgba(74, 124, 89, 0.2)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              marginBottom: 2,
              color: "#2d5016",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Info sx={{ color: "#f59e0b" }} />
            {t.welcome.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
          >
            {t.welcome.description}
          </Typography>
          <Box sx={{ textAlign: "center", marginTop: 2 }}>
            <Button
              component="a"
              href="https://www.instagram.com/trulsrudkollen"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<InstagramIcon />}
              sx={{
                color: "#7db88a",
                borderColor: "#7db88a",
                borderWidth: "2px",
                padding: "12px 24px",
                fontSize: "1.1rem",
                fontWeight: 500,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#7db88a",
                  color: "white",
                  borderColor: "#7db88a",
                },
              }}
            >
              {t.welcome.instagram}
            </Button>
          </Box>
        </Paper>

        {/* Ankomst og bruk av hytta */}
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            marginBottom: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            border: "2px solid rgba(74, 124, 89, 0.2)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              marginBottom: 3,
              color: "#2d5016",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Home sx={{ color: "#f59e0b" }} />
            {t.arrival.title}
          </Typography>

          {/* Ankomst */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4a7c59",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CheckCircle sx={{ color: "#4a7c59" }} />
              {t.arrival.arrivalSection.title}
            </Typography>
            <List dense>
              {t.arrival.arrivalSection.items.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {index === 0 && <Fireplace sx={{ color: "#4a7c59" }} />}
                    {index === 1 && (
                      <FireExtinguisher sx={{ color: "#dc2626" }} />
                    )}
                    {index === 2 && <WaterDrop sx={{ color: "#4a7c59" }} />}
                    {index === 3 && <Lightbulb sx={{ color: "#4a7c59" }} />}
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ textAlign: "center", marginY: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#4a7c59",
                textDecoration: "underline",
                cursor: "pointer",
                "&:hover": {
                  color: "#2d5016",
                },
              }}
              component="a"
              href="/Infoskriv.docx"
              download
            >
              {t.arrival.download}
            </Typography>
          </Box>

          <Divider sx={{ marginY: 2 }} />

          {/* Aske */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="h6" sx={{ color: "#4a7c59", marginBottom: 2 }}>
              {t.arrival.ash.title}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.ash.description}
            </Typography>
          </Box>

          {/* Brann */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#dc2626",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Warning sx={{ color: "#dc2626" }} />
              {t.arrival.fire.title}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.fire.description}
            </Typography>
          </Box>

          {/* Do */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="h6" sx={{ color: "#4a7c59", marginBottom: 2 }}>
              {t.arrival.toilet.title}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.toilet.description}
            </Typography>
          </Box>

          {/* Førstehjelp */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#dc2626",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Warning sx={{ color: "#dc2626" }} />
              {t.arrival.firstAid.title}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.firstAid.description}
            </Typography>
          </Box>

          {/* Gass */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4a7c59",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Fireplace sx={{ color: "#4a7c59" }} />
              {t.arrival.gas.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, marginBottom: 1 }}
            >
              {t.arrival.gas.description1}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.gas.description2}
            </Typography>
          </Box>

          {/* Kjøleskap på gass */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="h6" sx={{ color: "#4a7c59", marginBottom: 2 }}>
              {t.arrival.fridge.title}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.fridge.description}
            </Typography>
          </Box>

          {/* Koketopp */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4a7c59",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <LocalDining sx={{ color: "#4a7c59" }} />
              {t.arrival.stove.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, marginBottom: 1 }}
            >
              {t.arrival.stove.description1}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.stove.description2}
            </Typography>
          </Box>

          {/* Lys - strøm */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4a7c59",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Lightbulb sx={{ color: "#4a7c59" }} />
              {t.arrival.electricity.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, marginBottom: 1 }}
            >
              {t.arrival.electricity.description1}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.electricity.description2}
            </Typography>
          </Box>

          {/* Lys */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="h6" sx={{ color: "#4a7c59", marginBottom: 2 }}>
              {t.arrival.light.title}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.light.description}
            </Typography>
          </Box>

          {/* Vedovn */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4a7c59",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Fireplace sx={{ color: "#4a7c59" }} />
              {t.arrival.woodStove.title}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.woodStove.description}
            </Typography>
          </Box>

          {/* Peis */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4a7c59",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Fireplace sx={{ color: "#4a7c59" }} />
              {t.arrival.fireplace.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, marginBottom: 1 }}
            >
              {t.arrival.fireplace.description1}
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, marginBottom: 1 }}
            >
              {t.arrival.fireplace.description2}
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, marginBottom: 1 }}
            >
              {t.arrival.fireplace.description3}
            </Typography>
          </Box>

          {/* Uteplassen */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4a7c59",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <OutdoorGrill sx={{ color: "#4a7c59" }} />
              {t.arrival.outdoor.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, marginBottom: 1 }}
            >
              {t.arrival.outdoor.description1}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.outdoor.description2}
            </Typography>
          </Box>

          {/* Uthus */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4a7c59",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Storage sx={{ color: "#4a7c59" }} />
              {t.arrival.shed.title}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.shed.description}
            </Typography>
          </Box>

          {/* Vann */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4a7c59",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <WaterDrop sx={{ color: "#4a7c59" }} />
              {t.arrival.water.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, marginBottom: 1 }}
            >
              {t.arrival.water.description1}
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, marginBottom: 1 }}
            >
              {t.arrival.water.description2}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.water.description3}
            </Typography>
          </Box>

          {/* Ved */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4a7c59",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Fireplace sx={{ color: "#4a7c59" }} />
              {t.arrival.wood.title}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {t.arrival.wood.description}
            </Typography>
          </Box>
        </Paper>

        {/* Kontaktinformasjon modul */}
        <ContactInfo t={t} />
      </TabPanel>

      {/* TabPanel for turguide */}
      <TabPanel value={activeTab} index={1}>
        {/* Turguide */}
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            marginBottom: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            border: "2px solid rgba(74, 124, 89, 0.2)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              marginBottom: 3,
              color: "#2d5016",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocationOn sx={{ color: "#f59e0b" }} />
            {t.hiking.title}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Eventyrsti til Trulsrudkollen */}
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#4a7c59", marginBottom: 2 }}
              >
                {t.hiking.trails.trulsrudkollen.title}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {t.hiking.trails.trulsrudkollen.description}
              </Typography>
            </Box>

            {/* Buss fra Gullhaug */}
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#4a7c59", marginBottom: 2 }}
              >
                {t.hiking.trails.gullhaug.title}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {t.hiking.trails.gullhaug.description}
              </Typography>
            </Box>

            {/* Solfjellsstua */}
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#4a7c59", marginBottom: 2 }}
              >
                {t.hiking.trails.solfjellsstua.title}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {t.hiking.trails.solfjellsstua.description}
              </Typography>
            </Box>

            {/* Pannekaker på Bærums verk */}
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#4a7c59", marginBottom: 2 }}
              >
                {t.hiking.trails.baerumsverk.title}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {t.hiking.trails.baerumsverk.description}
              </Typography>
            </Box>

            {/* Kolsåstopp */}
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#4a7c59", marginBottom: 2 }}
              >
                {t.hiking.trails.kolsastopp.title}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {t.hiking.trails.kolsastopp.description}
              </Typography>
            </Box>

            {/* Kjaglidalen */}
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#4a7c59", marginBottom: 2 }}
              >
                {t.hiking.trails.kjaglidalen.title}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {t.hiking.trails.kjaglidalen.description}
              </Typography>
            </Box>

            {/* Pilegrimsleden */}
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#4a7c59", marginBottom: 2 }}
              >
                {t.hiking.trails.pilgrim.title}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {t.hiking.trails.pilgrim.description}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Kontaktinformasjon modul */}
        <ContactInfo t={t} />
      </TabPanel>

      {/* TabPanel for tilbakemelding */}
      <TabPanel value={activeTab} index={2}>
        {/* Tilbakemeldingsskjema */}
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            marginBottom: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            border: "2px solid rgba(74, 124, 89, 0.2)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              marginBottom: 1,
              color: "#2d5016",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {t.feedback.title}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              marginBottom: 1,
              color: "#4a7c59",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {t.feedback.subtitle}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              marginBottom: 4,
              textAlign: "center",
              color: "#666",
              lineHeight: 1.6,
            }}
          >
            {t.feedback.description}
          </Typography>

          <Box
            component="form"
            onSubmit={handleFeedbackSubmit}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            {/* Venstre kolonne */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label={t.feedback.form.name}
                value={feedbackForm.name}
                onChange={(e) => handleFeedbackChange("name", e.target.value)}
                variant="outlined"
                size="small"
              />

              <TextField
                label={t.feedback.form.email}
                type="email"
                value={feedbackForm.email}
                onChange={(e) => handleFeedbackChange("email", e.target.value)}
                variant="outlined"
                size="small"
              />

              <TextField
                label={t.feedback.form.stayPeriod}
                placeholder={t.feedback.form.stayPeriodPlaceholder}
                value={feedbackForm.stayPeriod}
                onChange={(e) =>
                  handleFeedbackChange("stayPeriod", e.target.value)
                }
                variant="outlined"
                size="small"
              />

              <FormControl size="small">
                <InputLabel>{t.feedback.form.category}</InputLabel>
                <Select
                  value={feedbackForm.category}
                  label={t.feedback.form.category}
                  onChange={(e) =>
                    handleFeedbackChange("category", e.target.value)
                  }
                >
                  <MenuItem value="general">
                    {t.feedback.form.categories.general}
                  </MenuItem>
                  <MenuItem value="facilities">
                    {t.feedback.form.categories.facilities}
                  </MenuItem>
                  <MenuItem value="cleanliness">
                    {t.feedback.form.categories.cleanliness}
                  </MenuItem>
                  <MenuItem value="location">
                    {t.feedback.form.categories.location}
                  </MenuItem>
                  <MenuItem value="communication">
                    {t.feedback.form.categories.communication}
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Høyre kolonne */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ marginBottom: 1, color: "#4a7c59" }}
                >
                  {t.feedback.form.rating}
                </Typography>
                <Rating
                  value={feedbackForm.rating}
                  onChange={(_, newValue) =>
                    handleFeedbackChange("rating", newValue)
                  }
                  size="large"
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: "#4a7c59",
                    },
                    "& .MuiRating-iconHover": {
                      color: "#4a7c59",
                    },
                  }}
                />
                {feedbackForm.rating > 0 && (
                  <Typography
                    variant="body2"
                    sx={{ marginTop: 1, color: "#666" }}
                  >
                    {t.feedback.form.ratingLabels[feedbackForm.rating]}
                  </Typography>
                )}
              </Box>

              <TextField
                label={t.feedback.form.feedback}
                placeholder={t.feedback.form.feedbackPlaceholder}
                value={feedbackForm.feedback}
                onChange={(e) =>
                  handleFeedbackChange("feedback", e.target.value)
                }
                variant="outlined"
                multiline
                rows={4}
                size="small"
              />
            </Box>
          </Box>

          <Box sx={{ textAlign: "center", marginTop: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={
                isSubmitting || !feedbackForm.rating || !feedbackForm.feedback
              }
              onClick={handleFeedbackSubmit}
              sx={{
                backgroundColor: "#4a7c59",
                "&:hover": {
                  backgroundColor: "#2d5016",
                },
                padding: "12px 32px",
                fontSize: "1.1rem",
                borderRadius: 2,
              }}
            >
              {isSubmitting
                ? t.feedback.form.submitting
                : t.feedback.form.submit}
            </Button>
          </Box>
        </Paper>

        {/* Kontaktinformasjon modul */}
        <ContactInfo t={t} />
      </TabPanel>

      {/* Snackbar for tilbakemelding */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ForHyttegjester;
