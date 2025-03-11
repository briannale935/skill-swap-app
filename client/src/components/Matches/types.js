/**
 * @typedef {Object} SkillSwapRequest
 * @property {string} id - Unique identifier for the request
 * @property {string} sender_id - ID of the user sending the request
 * @property {string} recipient_id - ID of the user receiving the request
 * @property {string} sender_name - Name of the sender
 * @property {string} recipient_name - Name of the recipient
 * @property {string} sender_skill - Skill offered by the sender
 * @property {string} requested_skill - Skill requested by the sender
 * @property {string} skill_description - Description of the sender's skill
 * @property {string} message - Request message
 * @property {string} time_availability - Sender's availability
 * @property {string} status - Current status (pending/accepted/declined/withdrawn)
 * @property {Date} created_at - When the request was created
 */

/**
 * @typedef {Object} SkillSwapMatch
 * @property {string} id - Unique identifier for the match
 * @property {string} partner_name - Name of the matched partner
 * @property {string} partner_skill - Skill offered by the partner
 * @property {string} your_skill - Your offered skill
 * @property {string} partnerEmail - Partner's email (only available after acceptance)
 * @property {number} sessions_completed - Number of completed learning sessions
 * @property {string} status - Current status of the match
 */

/**
 * @typedef {Object} SkillSwapHistory
 * @property {string} id - Unique identifier for the history entry
 * @property {string} partner_name - Name of the learning partner
 * @property {string} your_skill - Skill you taught
 * @property {string} partner_skill - Skill you learned
 * @property {string} duration - Total duration of the skill swap
 * @property {number} sessions_completed - Number of completed sessions
 * @property {string} status - Final status of the skill swap
 */

/**
 * @typedef {Object} ProgressUpdate
 * @property {number} sessions_completed - Number of completed sessions
 * @property {string} [feedback] - Optional feedback about the skill swap
 */

export const SkillSwapStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn',
  COMPLETED: 'completed'
}; 