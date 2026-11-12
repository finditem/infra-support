"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import type { TaskProjectKey } from "@/types/tables";
import type { FlowGraphData } from "../_lib/flowGraph";

const W = 960;
const PLOT_LEFT = 176;
const PLOT_RIGHT = W - 96;
const GRAPH_TOP = 58;
const AXIS_Y = 28;
const LANE = 34;
const BAND_GAP = 44;
const CURVE = 15;
const DOT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const PROJECT_LABEL: Record<TaskProjectKey, string> = {
  operations: "운영",
  mobile: "모바일",
  admin: "어드민",
  monitoring: "모니터링",
};

const FALLBACK_COLOR = "#8a8f98";

/** 범례에 고정 순서로 노출할 상태 이름. */
const STATUS_ORDER = ["할 일", "진행 중", "검토 중", "완료", "지연됨", "미완료"];

const trim = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}…` : text);

/** ISO 시각을 KST 기준 M/D로 표기한다. */
const formatKstMonthDay = (iso: string) => {
  const kst = new Date(Date.parse(iso) + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}/${kst.getUTCDate()}`;
};

interface Tip {
  title: string;
  sub: string;
  x: number;
  y: number;
}

/** 상위 일정을 줄기, 하위 일정을 가지로 그리는 깃 브랜치형 타임라인. */
const FlowGraph = ({ data }: { data: FlowGraphData }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const scene = useMemo(() => {
    const startMs = Date.parse(data.periodStart);
    const endMs = Math.max(Date.parse(data.periodEnd), startMs + DAY_MS);
    const span = endMs - startMs;
    const xOf = (iso: string) => {
      const clamped = Math.min(Math.max(Date.parse(iso), startMs), endMs);
      return PLOT_LEFT + ((clamped - startMs) / span) * (PLOT_RIGHT - PLOT_LEFT);
    };
    const colorOf = (statusId: string) => {
      const meta = data.statuses[statusId];
      if (!meta) return FALLBACK_COLOR;
      return isDark ? meta.colorDark : meta.color;
    };
    const nameOf = (statusId: string) => data.statuses[statusId]?.name ?? "";

    const todayX = xOf(new Date(Math.min(Date.now(), endMs)).toISOString());

    // 주 단위 눈금. "오늘" 라벨은 날짜줄보다 윗줄(알약)에 따로 두므로 눈금을 숨기지 않는다.
    const grid: { x: number; label: string }[] = [];
    for (let t = startMs; t <= endMs; t += 7 * DAY_MS) {
      const x = xOf(new Date(t).toISOString());
      grid.push({ x, label: formatKstMonthDay(new Date(t).toISOString()) });
    }

    const trunks: { x1: number; x2: number; y: number }[] = [];
    const paths: string[] = [];
    const labels: {
      x: number;
      y: number;
      text: string;
      muted?: boolean;
      color?: string;
      weight?: number;
      size?: number;
    }[] = [];
    const filled: { cx: number; cy: number; color: string }[] = [];
    const hollow: { cx: number; cy: number; stroke: string }[] = [];
    const hits: { cx: number; cy: number; title: string; sub: string }[] = [];

    let y = GRAPH_TOP;

    data.parents.forEach((parent) => {
      const trunkY = y;
      const geoms = parent.branches.map((branch, i) => {
        const offX = xOf(branch.startDate);
        const branchY = trunkY + (i + 1) * LANE;
        const isMerge = branch.endKind === "merge";
        const endX = xOf(branch.endDate);
        const lineEnd = isMerge ? endX - CURVE : endX;
        return { branch, offX, branchY, isMerge, endX, lineEnd };
      });

      // 줄기는 상위 일정의 수명대로 그린다: 생성 → (완료 시점 또는 오늘). 가지가 더 멀리 뻗으면 거기까지 늘린다.
      const parentStartX = xOf(parent.startDate);
      const parentEndX = xOf(parent.endDate);
      const parentIsMerge = parent.endKind === "merge";
      const trunkEnd = geoms.reduce((max, g) => Math.max(max, g.endX), parentEndX);
      trunks.push({ x1: parentStartX, x2: trunkEnd, y: trunkY });

      // 상위 일정 시작 노드 + 라벨(제목 + 프로젝트)
      hollow.push({ cx: parentStartX, cy: trunkY, stroke: "trunk" });
      hits.push({
        cx: parentStartX,
        cy: trunkY,
        title: parent.title,
        sub: `${formatKstMonthDay(parent.startDate)} · 상위 일정 시작`,
      });
      labels.push({ x: 14, y: trunkY - 1, text: trim(parent.title, 13), weight: 700, size: 13 });
      labels.push({
        x: 14,
        y: trunkY + 12,
        text: PROJECT_LABEL[parent.projectKey],
        muted: true,
        size: 10.5,
      });

      // 상위 일정 끝 노드: 완료면 상태 색으로 줄기를 닫고, 미완료면 오늘까지 열린 고리 + 상태 라벨.
      if (parentIsMerge) {
        filled.push({ cx: parentEndX, cy: trunkY, color: colorOf(parent.endStatusId) });
        hits.push({
          cx: parentEndX,
          cy: trunkY,
          title: parent.title,
          sub: `${formatKstMonthDay(parent.endDate)} · 완료`,
        });
      } else if (parentEndX - parentStartX > 2) {
        const parentEndColor = colorOf(parent.endStatusId);
        hollow.push({ cx: parentEndX, cy: trunkY, stroke: parentEndColor });
        labels.push({
          x: parentEndX + 10,
          y: trunkY + 4,
          text: nameOf(parent.endStatusId),
          color: parentEndColor,
          weight: 600,
          size: 11,
        });
        hits.push({
          cx: parentEndX,
          cy: trunkY,
          title: parent.title,
          sub: `${formatKstMonthDay(parent.endDate)} · ${nameOf(parent.endStatusId)}`,
        });
      }

      geoms.forEach(({ branch, offX, branchY, isMerge, endX, lineEnd }) => {
        let d = `M ${offX} ${trunkY} C ${offX + CURVE} ${trunkY} ${offX} ${branchY} ${offX + CURVE} ${branchY}`;
        d += ` L ${Math.max(lineEnd, offX + CURVE)} ${branchY}`;
        if (isMerge) d += ` C ${endX} ${branchY} ${endX - CURVE} ${trunkY} ${endX} ${trunkY}`;
        paths.push(d);

        labels.push({
          x: offX + CURVE + 4,
          y: branchY - 9,
          text: trim(branch.title, 18),
          muted: true,
          size: 11.5,
        });

        // 가지 시작(생성) 노드
        const createX = offX + CURVE;
        hollow.push({ cx: createX, cy: branchY, stroke: "trunk" });
        hits.push({
          cx: createX,
          cy: branchY,
          title: branch.title,
          sub: `${formatKstMonthDay(branch.startDate)} · 생성`,
        });

        // 상태 전이 점(완료 전이는 합류 노드로 대체하므로 제외)
        branch.commits.forEach((commit) => {
          if (isMerge && commit.date === branch.endDate) return;
          const cx = xOf(commit.date);
          filled.push({ cx, cy: branchY, color: colorOf(commit.statusId) });
          hits.push({
            cx,
            cy: branchY,
            title: branch.title,
            sub: `${formatKstMonthDay(commit.date)} · ${nameOf(commit.statusId)}`,
          });
        });

        if (isMerge) {
          filled.push({ cx: endX, cy: trunkY, color: colorOf(branch.endStatusId) });
          hits.push({
            cx: endX,
            cy: trunkY,
            title: branch.title,
            sub: `${formatKstMonthDay(branch.endDate)} · 완료`,
          });
        } else {
          const endColor = colorOf(branch.endStatusId);
          hollow.push({ cx: endX, cy: branchY, stroke: endColor });
          labels.push({
            x: endX + 10,
            y: branchY + 4,
            text: nameOf(branch.endStatusId),
            color: endColor,
            weight: 600,
            size: 11,
          });
          hits.push({
            cx: endX,
            cy: branchY,
            title: branch.title,
            sub: `${formatKstMonthDay(branch.endDate)} · ${nameOf(branch.endStatusId)} (미완료)`,
          });
        }
      });

      y = trunkY + parent.branches.length * LANE + BAND_GAP;
    });

    const height = Math.max(y - BAND_GAP + 24, GRAPH_TOP + 24);
    return { grid, todayX, trunks, paths, labels, filled, hollow, hits, height };
  }, [data, isDark]);

  const legend = useMemo(
    () =>
      STATUS_ORDER.map((name) => {
        const entry = Object.values(data.statuses).find((meta) => meta.name === name);
        return entry ? { name, color: isDark ? entry.colorDark : entry.color } : null;
      }).filter((item): item is { name: string; color: string } => item !== null),
    [data.statuses, isDark]
  );

  const showTip = (title: string, sub: string, e: { clientX: number; clientY: number }) =>
    setTip({ title, sub, x: e.clientX, y: e.clientY });

  return (
    <div className="relative">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-elevated">
        <svg
          aria-label="상위·하위 일정 브랜치 그래프"
          role="img"
          className="block"
          height={scene.height}
          viewBox={`0 0 ${W} ${scene.height}`}
          width={W}
        >
          {scene.grid.map((g, i) => (
            <g key={`grid-${i}`}>
              <line
                className="stroke-border"
                strokeWidth={1}
                x1={g.x}
                x2={g.x}
                y1={GRAPH_TOP - 16}
                y2={scene.height - 10}
              />
              <text className="fill-text-muted" fontSize={10.5} x={g.x + 4} y={AXIS_Y}>
                {g.label}
              </text>
            </g>
          ))}

          <line
            className="stroke-primary"
            opacity={0.7}
            strokeDasharray="3 3"
            strokeWidth={1}
            x1={scene.todayX}
            x2={scene.todayX}
            y1={GRAPH_TOP - 16}
            y2={scene.height - 10}
          />
          <rect
            className="fill-primary"
            height={15}
            rx={7.5}
            width={30}
            x={scene.todayX - 15}
            y={2}
          />
          <text
            className="fill-text-inverse"
            fontSize={10}
            fontWeight={600}
            textAnchor="middle"
            x={scene.todayX}
            y={13}
          >
            오늘
          </text>

          {scene.trunks.map((t, i) => (
            <line
              key={`trunk-${i}`}
              className="stroke-text-muted"
              strokeLinecap="round"
              strokeOpacity={0.5}
              strokeWidth={3.5}
              x1={t.x1}
              x2={t.x2}
              y1={t.y}
              y2={t.y}
            />
          ))}

          {scene.paths.map((d, i) => (
            <path
              key={`path-${i}`}
              className="stroke-text-muted"
              d={d}
              fill="none"
              strokeOpacity={0.35}
              strokeWidth={2}
            />
          ))}

          {scene.labels.map((l, i) => (
            <text
              key={`label-${i}`}
              className={l.color ? undefined : l.muted ? "fill-text-muted" : "fill-text-default"}
              style={l.color ? { fill: l.color } : undefined}
              fontSize={l.size ?? 12}
              fontWeight={l.weight ?? 400}
              x={l.x}
              y={l.y}
            >
              {l.text}
            </text>
          ))}

          {scene.hollow.map((n, i) => (
            <circle
              key={`hollow-${i}`}
              className={
                n.stroke === "trunk"
                  ? "fill-surface-elevated stroke-text-muted"
                  : "fill-surface-elevated"
              }
              style={n.stroke === "trunk" ? undefined : { stroke: n.stroke }}
              cx={n.cx}
              cy={n.cy}
              r={n.stroke === "trunk" ? 5.5 : DOT + 0.5}
              strokeOpacity={n.stroke === "trunk" ? 0.6 : 1}
              strokeWidth={2.6}
            />
          ))}

          {scene.filled.map((n, i) => (
            <circle key={`filled-${i}`} style={{ fill: n.color }} cx={n.cx} cy={n.cy} r={DOT} />
          ))}

          {scene.hits.map((h, i) => (
            <circle
              key={`hit-${i}`}
              className="cursor-pointer"
              cx={h.cx}
              cy={h.cy}
              fill="transparent"
              r={12}
              onMouseEnter={(e) => showTip(h.title, h.sub, e)}
              onMouseLeave={() => setTip(null)}
              onMouseMove={(e) => showTip(h.title, h.sub, e)}
            />
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-text-muted">
        {legend.map((item) => (
          <span key={item.name} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
        ))}
        <span className="mx-1 h-3.5 w-px bg-border" />
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-text-muted" />
          채워진 끝 = 완료
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-text-muted" />
          열린 끝(고리) = 아직 진행 중, 오늘까지 이어짐
        </span>
      </div>

      {tip && (
        <div
          className="pointer-events-none fixed z-20 flex flex-col gap-0.5 rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5 shadow-lg"
          style={{
            left: Math.min(
              tip.x + 14,
              (typeof window !== "undefined" ? window.innerWidth : 960) - 240
            ),
            top: tip.y + 14,
          }}
        >
          <span className="text-xs font-semibold text-text-default">{tip.title}</span>
          <span className="text-[11px] tabular-nums text-text-muted">{tip.sub}</span>
        </div>
      )}
    </div>
  );
};

export default FlowGraph;
