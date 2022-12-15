export enum XRExpressionType {
  "brow_lowerer_left",
  "brow_lowerer_right",
  "cheek_puff_left",
  "cheek_puff_right",
  "cheek_raiser_left",
  "cheek_raiser_right",
  "cheek_suck_left",
  "cheek_suck_right",
  "chin_raiser_bottom",
  "chin_raiser_top",
  "dimpler_left",
  "dimpler_right",
  "eyes_closed_left",
  "eyes_closed_right",
  "eyes_look_down_left",
  "eyes_look_down_right",
  "eyes_look_left_left",
  "eyes_look_left_right",
  "eyes_look_right_left",
  "eyes_look_right_right",
  "eyes_look_up_left",
  "eyes_look_up_right",
  "inner_brow_raiser_left",
  "inner_brow_raiser_right",
  "jaw_drop",
  "jaw_sideways_left",
  "jaw_sideways_right",
  "jaw_thrust",
  "lid_tightener_left",
  "lid_tightener_right",
  "lip_corner_depressor_left",
  "lip_corner_depressor_right",
  "lip_corner_puller_left",
  "lip_corner_puller_right",
  "lip_funneler_left_bottom",
  "lip_funneler_left_top",
  "lip_funneler_right_bottom",
  "lip_funneler_right_top",
  "lip_pressor_left",
  "lip_pressor_right",
  "lip_pucker_left",
  "lip_pucker_right",
  "lip_stretcher_left",
  "lip_stretcher_right",
  "lip_suck_left_bottom",
  "lip_suck_left_top",
  "lip_suck_right_bottom",
  "lip_suck_right_top",
  "lip_tightener_left",
  "lip_tightener_right",
  "lips_toward",
  "lower_lip_depressor_left",
  "lower_lip_depressor_right",
  "mouth_left",
  "mouth_right",
  "nose_wrinkler_left",
  "nose_wrinkler_right",
  "outer_brow_raiser_left",
  "outer_brow_raiser_right",
  "upper_lid_raiser_left",
  "upper_lid_raiser_right",
  "upper_lip_raiser_left",
  "upper_lip_raiser_right"
}

const ExpressionWeightAdjustment: Record<string, number> = {
  "brow_lowerer_left" : 2,
  "brow_lowerer_right" : 2,
  "inner_brow_raiser_left" : 2,
  "INNERinner_brow_raiser_right_BROW_RAISER_R" : 2,
  "outer_brow_raiser_left" : 2,
  "outer_brow_raiser_right" : 2,
  "eyes_closed_left" : 1.75,
  "eyes_closed_right" : 1.75,
};

export const getExpressionWeight = (frame, expression: XRExpressionType) => {
  let adjustment = ExpressionWeightAdjustment[XRExpressionType[expression]];
  if (adjustment === undefined) {
    adjustment = 1;
  }
  return frame.expressions.get(XRExpressionType[expression]);// * adjustment;
};

export const getExpressionName = (expression: XRExpressionType) => {
    // https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings
    let ex = XRExpressionType[expression]
    return ex
}
