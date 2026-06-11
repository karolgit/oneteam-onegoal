"use client";

import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import "highcharts/highcharts-3d";
import type { Options } from "highcharts";
import type { Account, Meeting, ProductInterest, Transcript } from "@/lib/data";

const chartColors = ["#C74634", "#2563eb", "#059669", "#d97706", "#7c3aed", "#475569"];
const meetingCalendarYear = 2026;

Highcharts.setOptions({
  colors: chartColors,
  credits: {
    enabled: false
  },
  lang: {
    thousandsSep: ","
  }
});

const baseChart: Options = {
  chart: {
    backgroundColor: "transparent",
    style: {
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    }
  },
  title: {
    style: {
      color: "#0f172a",
      fontSize: "15px",
      fontWeight: "700"
    }
  },
  legend: {
    itemStyle: {
      color: "#475569",
      fontWeight: "600"
    }
  },
  tooltip: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
    borderRadius: 6,
    style: {
      color: "#ffffff"
    }
  }
};

function ChartCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur">
      {children}
    </section>
  );
}

function getMonthKeys() {
  return Array.from({ length: 12 }, (_, index) => {
    const key = `${meetingCalendarYear}-${String(index + 1).padStart(2, "0")}`;
    const label = new Date(`${key}-01T00:00:00`).toLocaleString("en-US", { month: "short" });
    return { key, label };
  });
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function countByMonth(items: string[]) {
  return getMonthKeys().map(({ key }) => items.filter((date) => date.slice(0, 7) === key).length);
}

function getPipelineOptions(meetings: Meeting[], transcripts: Transcript[]): Options {
  const monthKeys = getMonthKeys();
  const todayKey = getTodayKey();
  const historicalMeetings = meetings.filter((meeting) => meeting.date <= todayKey);
  const futureMeetings = meetings.filter((meeting) => meeting.date > todayKey);

  return {
    ...baseChart,
    chart: {
      ...baseChart.chart,
      type: "column",
      height: 330,
      options3d: {
        enabled: true,
        alpha: 10,
        beta: 14,
        depth: 54,
        viewDistance: 28
      }
    },
    title: {
      text: "Meeting Intelligence Momentum",
      style: baseChart.title?.style
    },
    xAxis: {
      categories: monthKeys.map((month) => month.label),
      labels: {
        style: {
          color: "#64748b"
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "SQLite activity"
      },
      labels: {
        style: {
          color: "#64748b"
        }
      }
    },
    plotOptions: {
      column: {
        depth: 34,
        borderRadius: 3,
        grouping: true
      }
    },
    series: [
      {
        type: "column",
        name: "Meetings",
        data: countByMonth(meetings.map((meeting) => meeting.date))
      },
      {
        type: "column",
        name: "Historical Notes",
        data: countByMonth(historicalMeetings.map((meeting) => meeting.date))
      },
      {
        type: "column",
        name: "Future Prep Ready",
        data: countByMonth(futureMeetings.map((meeting) => meeting.date))
      },
      {
        type: "column",
        name: "Uploads",
        data: countByMonth(transcripts.map((transcript) => transcript.uploadedAt))
      }
    ]
  };
}

function getProductOptions(productInterest: ProductInterest[]): Options {
  return {
    ...baseChart,
    chart: {
      ...baseChart.chart,
      type: "pie",
      height: 330,
      options3d: {
        enabled: true,
        alpha: 46,
        beta: 0
      }
    },
    title: {
      text: "Product Interest Mix",
      style: baseChart.title?.style
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        depth: 34,
        innerSize: 58,
        dataLabels: {
          enabled: true,
          format: "{point.name}",
          style: {
            color: "#334155",
            fontSize: "11px",
            textOutline: "none"
          }
        }
      }
    },
    series: [
      {
        type: "pie",
        name: "Interest",
        data: productInterest.map((item) => ({
          name: item.product,
          y: item.value
        }))
      }
    ]
  };
}

function getEngagementOptions(accounts: Account[]): Options {
  const topAccounts = [...accounts].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 7);

  return {
    ...baseChart,
    chart: {
      ...baseChart.chart,
      type: "column",
      height: 330,
      options3d: {
        enabled: true,
        alpha: 12,
        beta: -12,
        depth: 50,
        viewDistance: 26
      }
    },
    title: {
      text: "Top Account Engagement",
      style: baseChart.title?.style
    },
    xAxis: {
      categories: topAccounts.map((account) => account.name),
      labels: {
        rotation: -30,
        style: {
          color: "#64748b",
          fontSize: "10px"
        }
      }
    },
    yAxis: {
      max: 100,
      title: {
        text: "Engagement score"
      },
      labels: {
        style: {
          color: "#64748b"
        }
      }
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      column: {
        depth: 32,
        borderRadius: 3,
        colorByPoint: true
      }
    },
    series: [
      {
        type: "column",
        name: "Engagement",
        data: topAccounts.map((account) => account.engagementScore)
      }
    ]
  };
}

export function DashboardCharts({
  accounts,
  meetings,
  productInterest,
  transcripts
}: {
  accounts: Account[];
  meetings: Meeting[];
  productInterest: ProductInterest[];
  transcripts: Transcript[];
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <ChartCard>
        <HighchartsReact highcharts={Highcharts} options={getPipelineOptions(meetings, transcripts)} />
      </ChartCard>
      <ChartCard>
        <HighchartsReact highcharts={Highcharts} options={getProductOptions(productInterest)} />
      </ChartCard>
      <div className="xl:col-span-2">
        <ChartCard>
          <HighchartsReact highcharts={Highcharts} options={getEngagementOptions(accounts)} />
        </ChartCard>
      </div>
    </section>
  );
}
