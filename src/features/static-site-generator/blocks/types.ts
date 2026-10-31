import type { ZodType } from "zod";
import type { Facts } from "./facts";

export type BlockKind = "copy" | "fact";

export type BlockDefinition<Props> = {
  type: string;
  kind: BlockKind;
  schema: ZodType<Props>;
  needs: (facts: Facts) => boolean;
  fixtures: {
    full: Props;
    minimal: Props;
  };
};
