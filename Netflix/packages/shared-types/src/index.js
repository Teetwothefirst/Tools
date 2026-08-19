"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = exports.VideoQuality = exports.ProcessingStatus = exports.MaturityRating = exports.UserRole = void 0;
// Global User Roles
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["CONTENT_MANAGER"] = "CONTENT_MANAGER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
// Profile Maturity Content Restrictions
var MaturityRating;
(function (MaturityRating) {
    MaturityRating["G"] = "G";
    MaturityRating["PG"] = "PG";
    MaturityRating["PG13"] = "PG13";
    MaturityRating["R"] = "R";
    MaturityRating["NC17"] = "NC17";
    MaturityRating["TV_Y"] = "TV_Y";
    MaturityRating["TV_Y7"] = "TV_Y7";
    MaturityRating["TV_G"] = "TV_G";
    MaturityRating["TV_PG"] = "TV_PG";
    MaturityRating["TV_14"] = "TV_14";
    MaturityRating["TV_MA"] = "TV_MA";
})(MaturityRating || (exports.MaturityRating = MaturityRating = {}));
// Media Transcoding Status
var ProcessingStatus;
(function (ProcessingStatus) {
    ProcessingStatus["PENDING"] = "PENDING";
    ProcessingStatus["PROCESSING"] = "PROCESSING";
    ProcessingStatus["COMPLETED"] = "COMPLETED";
    ProcessingStatus["FAILED"] = "FAILED";
})(ProcessingStatus || (exports.ProcessingStatus = ProcessingStatus = {}));
// HLS Stream Video Quality Levels
var VideoQuality;
(function (VideoQuality) {
    VideoQuality["Q_360P"] = "360p";
    VideoQuality["Q_480P"] = "480p";
    VideoQuality["Q_720P"] = "720p";
    VideoQuality["Q_1080P"] = "1080p";
})(VideoQuality || (exports.VideoQuality = VideoQuality = {}));
// Subscription Status Tiers
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["CANCELLED"] = "CANCELLED";
    SubscriptionStatus["PAST_DUE"] = "PAST_DUE";
    SubscriptionStatus["EXPIRED"] = "EXPIRED";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
