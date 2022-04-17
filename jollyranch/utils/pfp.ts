import * as anchor from "@project-serum/anchor";
import {Program, Provider} from "@project-serum/anchor";
import pfpIDL from "../lib/idl/pfp_idl.json";

export function getPfpProgram(provider: Provider) {
  return new Program(pfpIDL as anchor.Idl, process.env.NEXT_PUBLIC_PFP_PROGRAM as string, provider);
}


export const PFP_LOCK_MULTIPLIERS = [
  {days:7, multiplier:1.02},
  {days:14, multiplier:1.03},
  {days:21, multiplier:1.04},
  {days:28, multiplier:1.05}
];
