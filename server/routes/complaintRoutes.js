const express = require("express");
const router = express.Router();
const {
  submitComplaint,
  getAllComplaints,
  getUserComplaints,
  assign,
  resolvedComplaint,
  track,
  complaintTypes
} = require("../controllers/complaintController");
const upload = require("../utils/upload");

router.get("/", getAllComplaints);
router.post("/", upload.array("attachments"), submitComplaint);

router.get("/complaint_types", complaintTypes);
router.get("/user/:email", getUserComplaints);

router.put("/:id/assign", assign);
router.patch("/:id", resolvedComplaint);

router.post("/track", track);

module.exports = router;
