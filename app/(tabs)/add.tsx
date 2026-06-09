import { useState } from "react";
import { View, useWindowDimensions, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/Text";
import { Stack } from "expo-router";
import { BrandLogo } from "@/components/BrandLogo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Path, Rect, G, Defs, LinearGradient, Stop,
  Text as SvgText,
} from "react-native-svg";
import { useFees, useCancelledFees } from "@/lib/store";
import {
  computeInsights,
  type MonthPoint,
  type CategoryPoint,
  type BigFeePoint,
} from "@/lib/insights";

const BG      = "#F7F8FA";
const CARD    = "#FFFFFF";
const BORDER  = "#ECEEF1";
const TEXT    = "#11151C";
const MUTED   = "#6A7280";
const CORAL   = "#FF6B5C";
const NEUTRAL = "#E4E7EB";
const SHADOW  = { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as const;
const CARD_STYLE = {
  backgroundColor: CARD, borderRadius: 16,
  borderWidth: 1, borderColor: BORDER, padding: 24, ...SHADOW,
} as const;

// ─── chart helpers ────────────────────────────────────────────────────────────

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cpx} ${pts[i - 1].y} ${cpx} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

// ─── Section 2: savings chart ─────────────────────────────────────────────────

function SavingsChart({ data, width }: { data: MonthPoint[]; width: number }) {
  const H   = 108;
  const pad = { t: 8, b: 22, l: 12, r: 12 };
  const innerW = width - pad.l - pad.r;

  if (data.length === 0) {
    return (
      <View style={{ height: H, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 13, color: MUTED }}>Nothing saved yet this year</Text>
      </View>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 1) {
    return (
      <Svg width={width} height={H}>
        <Path
          d={`M ${pad.l} ${H - pad.b} L ${width - pad.r} ${H - pad.b}`}
          fill="none" stroke={CORAL} strokeWidth="2" strokeDasharray="4 4"
        />
        <SvgText x={pad.l} y={H - 4} fontSize="10" fill={MUTED}>{data[0].month}</SvgText>
      </Svg>
    );
  }

  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * innerW,
    y: pad.t + (1 - d.value / max) * (H - pad.t - pad.b),
    month: d.month,
  }));

  const line = smoothPath(pts);
  const area = line + ` L ${pts[pts.length - 1].x} ${H - pad.b} L ${pts[0].x} ${H - pad.b} Z`;

  return (
    <Svg width={width} height={H}>
      <Defs>
        <LinearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={CORAL} stopOpacity="0.22" />
          <Stop offset="1" stopColor={CORAL} stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="sl" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#B8180F" />
          <Stop offset="1" stopColor={CORAL} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#sg)" />
      <Path d={line} fill="none" stroke="url(#sl)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p) => (
        <SvgText key={p.month} x={p.x} y={H - 4} textAnchor="middle" fontSize="10" fill={MUTED}>
          {p.month}
        </SvgText>
      ))}
    </Svg>
  );
}

// ─── Section 3: spend bar chart (tappable bars + tooltip) ─────────────────────

const TOOLTIP_W = 64;
const TOOLTIP_H = 28;

function SpendChart({ data, width }: { data: MonthPoint[]; width: number }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(data.length - 1);
  const H   = 108;
  const pad = { t: 8, b: 22, l: 4, r: 4 };
  const max  = Math.max(...data.map((d) => d.value), 1);
  const slot = (width - pad.l - pad.r) / Math.max(data.length, 1);
  const bw   = slot * 0.55;

  const tooltip = selectedIdx !== null && data[selectedIdx] != null ? (() => {
    const d   = data[selectedIdx];
    const bh  = (d.value / max) * (H - pad.t - pad.b);
    const barCX = pad.l + selectedIdx * slot + slot / 2;
    const barTopY = H - pad.b - bh;
    const left = Math.max(0, Math.min(width - TOOLTIP_W, barCX - TOOLTIP_W / 2));
    const top  = Math.max(0, barTopY - TOOLTIP_H - 6);
    return { d, left, top };
  })() : null;

  return (
    <View>
      <Svg width={width} height={H}>
        <Defs>
          <LinearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={CORAL} stopOpacity="1" />
            <Stop offset="1" stopColor="#B8180F" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {data.map((d, i) => {
          const bh  = (d.value / max) * (H - pad.t - pad.b);
          const x   = pad.l + i * slot + (slot - bw) / 2;
          const y   = H - pad.b - bh;
          const sel = selectedIdx === i;
          const isNow = i === data.length - 1;
          return (
            <G key={d.month} onPress={() => setSelectedIdx(i === selectedIdx ? null : i)}>
              {/* expanded hit area */}
              <Rect x={pad.l + i * slot} y={0} width={slot} height={H} fill="transparent" />
              <Rect x={x} y={y} width={bw} height={bh} fill={sel ? "url(#cg)" : NEUTRAL} rx={3} />
              <SvgText
                x={x + bw / 2} y={H - 4}
                textAnchor="middle" fontSize="10"
                fill={sel || isNow ? CORAL : MUTED}
                fontWeight={sel || isNow ? "600" : "400"}
              >
                {d.month}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {tooltip && (
        <View style={{
          position: "absolute",
          top: tooltip.top,
          left: tooltip.left,
          width: TOOLTIP_W,
          height: TOOLTIP_H,
          backgroundColor: CARD,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: BORDER,
          alignItems: "center",
          justifyContent: "center",
          ...SHADOW,
        }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: CORAL, fontVariant: ["tabular-nums"] }}>
            €{tooltip.d.value}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Section 4: category rows ─────────────────────────────────────────────────

function CategoryRows({ data }: { data: CategoryPoint[] }) {
  if (data.length === 0) return <Text style={{ fontSize: 13, color: MUTED }}>No active fees</Text>;
  const max = data[0].monthly;
  return (
    <View style={{ gap: 18 }}>
      {data.map((cat, i) => (
        <View key={cat.category} style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: TEXT }}>{cat.category}</Text>
            <Text style={{ fontSize: 13, color: MUTED, fontVariant: ["tabular-nums"] }}>€{Math.round(cat.monthly)}</Text>
          </View>
          <View style={{ height: 6, backgroundColor: "#F0F2F5", borderRadius: 3 }}>
            <View style={{ width: `${(cat.monthly / max) * 100}%`, height: 6, backgroundColor: i === 0 ? CORAL : NEUTRAL, borderRadius: 3 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Section 5: biggest fees ──────────────────────────────────────────────────

type FeeMode = "monthly" | "yearly";

function BiggestFees({ data }: { data: BigFeePoint[] }) {
  const [mode, setMode] = useState<FeeMode>("yearly");

  if (data.length === 0) return <Text style={{ fontSize: 13, color: MUTED }}>No active fees</Text>;

  const sorted = [...data].sort((a, b) =>
    mode === "yearly" ? b.annual - a.annual : b.monthly - a.monthly
  );
  const maxVal = mode === "yearly" ? sorted[0].annual : sorted[0].monthly;

  return (
    <View style={{ gap: 20 }}>
      {/* title + toggle row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: TEXT }}>Biggest fees</Text>
        <View style={{ flexDirection: "row", backgroundColor: "#F0F2F5", borderRadius: 10, padding: 3 }}>
          {(["monthly", "yearly"] as FeeMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: mode === m ? CARD : "transparent",
                ...(mode === m ? { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } } : {}),
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: mode === m ? "600" : "400", color: mode === m ? TEXT : MUTED }}>
                {m === "monthly" ? "Monthly" : "Yearly"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {sorted.map(({ fee, annual, monthly }, i) => {
        const val = mode === "yearly" ? annual : monthly;
        const label = mode === "yearly"
          ? `€${Math.round(annual)}/yr`
          : `€${Math.round(monthly)}/mo`;
        return (
          <View key={fee.id} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <BrandLogo domain={fee.domain} name={fee.name} size={36} />
            <View style={{ flex: 1, gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: TEXT }}>{fee.name}</Text>
                <Text style={{ fontSize: 13, color: MUTED, fontVariant: ["tabular-nums"] }}>{label}</Text>
              </View>
              <View style={{ height: 3, backgroundColor: "#F0F2F5", borderRadius: 2 }}>
                <View style={{ width: `${(val / maxVal) * 100}%`, height: 3, backgroundColor: i === 0 ? CORAL : "#D1D5DB", borderRadius: 2 }} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── main screen ──────────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 32 - 40;

  const fees          = useFees();
  const cancelledFees = useCancelledFees();
  const insights      = computeInsights(fees, cancelledFees, new Date());

  const {
    monthlyTotal, savedThisYear, cancelledThisYearCount,
    savingsByMonth, spendByMonth, spendByCategory, biggestFees,
  } = insights;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 120, paddingHorizontal: 16, gap: 16 }}
        >
          <View style={{ paddingVertical: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: TEXT, letterSpacing: -0.5 }}>Insights</Text>
          </View>

          {/* Section 1 — Saved this year */}
          <View style={{ ...CARD_STYLE, alignItems: "flex-start", gap: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: "500", color: MUTED }}>saved this year</Text>
            <Text style={{ fontSize: 56, fontWeight: "700", color: CORAL, letterSpacing: -2, lineHeight: 62, fontVariant: ["tabular-nums"] }}>
              €{Math.round(savedThisYear)}
            </Text>
            <Text style={{ fontSize: 14, color: MUTED }}>
              {cancelledThisYearCount === 0
                ? "Nothing cancelled yet"
                : `from ${cancelledThisYearCount} fee${cancelledThisYearCount === 1 ? "" : "s"} you cancelled`}
            </Text>
          </View>

          {/* Section 2 — Savings adding up */}
          <View style={{ ...CARD_STYLE, gap: 20, overflow: "hidden" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: TEXT }}>Savings adding up</Text>
            <SavingsChart data={savingsByMonth} width={chartWidth} />
          </View>

          {/* Section 3 — What you spend */}
          <View style={{ ...CARD_STYLE, gap: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: TEXT }}>What you spend</Text>
              <Text style={{ fontSize: 12, color: MUTED, fontVariant: ["tabular-nums"] }}>≈ €{monthlyTotal} / month</Text>
            </View>
            <SpendChart data={spendByMonth} width={chartWidth} />
          </View>

          {/* Section 4 — Where it goes */}
          <View style={{ ...CARD_STYLE, gap: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: TEXT }}>Where it goes</Text>
            <CategoryRows data={spendByCategory} />
          </View>

          {/* Section 5 — Biggest fees */}
          <View style={{ ...CARD_STYLE, gap: 20 }}>
            <BiggestFees data={biggestFees} />
          </View>

          {/* Stat strip */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { value: String(fees.length),         label: "active"       },
              { value: String(cancelledFees.length), label: "cancelled"    },
              { value: String(fees.filter((f) => f.daysUntil <= 7).length), label: "renewing soon" },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, ...CARD_STYLE, paddingVertical: 14, alignItems: "center", gap: 2 }}>
                <Text style={{ fontSize: 22, fontWeight: "700", color: TEXT, letterSpacing: -0.5, fontVariant: ["tabular-nums"] }}>
                  {s.value}
                </Text>
                <Text style={{ fontSize: 11, color: MUTED, textAlign: "center" }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
