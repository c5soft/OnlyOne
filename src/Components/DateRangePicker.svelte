<script lang="ts">
    import {createEventDispatcher} from "svelte";

    interface Labels {
        notSet: string;
        greaterThan: string;
        lessThan: string;
        range: string;
        day: string;
        days: string;
        apply: string;
    }

    export let name: string;
    export let heading: string = "Date Range:";
    export let dateMin: Date;
    export let dateMax: Date;
    export let labels: Labels = {
        notSet: "not set",
        greaterThan: "greater than",
        lessThan: "less than",
        range: "range",
        day: "day",
        days: "days!!",
        apply: "apply",
    };

    if (!dateMax) dateMax = new Date();

    if (!dateMin) {
        dateMin = new Date(
            new Date().setFullYear(dateMax.getFullYear(), dateMax.getMonth() - 12)
        );
    }

    const dispatch = createEventDispatcher();

    let today = new Date();

    const todayRfc = timeStampToRfc(today);
    const todayTimestamp = dateToTimeStamp(today);
    const startDateMinTimestamp = dateToTimeStamp(dateMin);
    const endDateMaxTimestamp = dateToTimeStamp(dateMax);
    const startDateMinRfc = timeStampToRfc(dateMin);
    const endDateMaxRfc = timeStampToRfc(dateMax);

    let sliderStartTimestamp = todayTimestamp;
    let sliderEndTimestamp = todayTimestamp;

    let lessThan = false;
    let greaterThan = false;
    let daysInDateRange;

    export let dateFrom = todayRfc;
    export let dateTo = todayRfc;
    setDateRange("本月");

    $: daysInDateRange = numberOfDaysBetweenSelectedDateRange(dateFrom, dateTo);

    function dateOrSliderChange(item: string) {
        if (item == "endDate" && dateTo && dateTo < dateFrom) dateFrom = dateTo;

        if (item == "startDate" && dateFrom && dateFrom > dateTo && dateTo)
            dateTo = dateFrom;

        if (item == "endDate" || item == "startDate") {
            sliderEndTimestamp = dateToTimeStamp(dateTo);
            sliderStartTimestamp = dateToTimeStamp(dateFrom);
        }

        if (
            (item == "sliderEndTimestamp" &&
                sliderEndTimestamp < sliderStartTimestamp) ||
            !sliderStartTimestamp
        )
            sliderStartTimestamp = sliderEndTimestamp;

        if (
            (item == "sliderStartTimestamp" &&
                sliderStartTimestamp > sliderEndTimestamp) ||
            !sliderEndTimestamp
        )
            sliderEndTimestamp = sliderStartTimestamp;

        if (item == "sliderEndTimestamp" || item == "sliderStartTimestamp") {
            dateTo = timeStampToRfc(sliderEndTimestamp);
            dateFrom = timeStampToRfc(sliderStartTimestamp);
        }

        if (!dateTo && dateFrom) {
            greaterThan = true;
            lessThan = false;
        }
        if (!dateFrom && dateTo) {
            greaterThan = false;
            lessThan = true;
        }
        if (dateFrom && dateTo) {
            lessThan = false;
            greaterThan = false;
        }
    }

    function timeStampToRfc(date) {
        if (date) return new Date(date).toJSON().slice(0, 10);
        return undefined;
    }

    function dateToTimeStamp(date) {
        if (date) return new Date(date).valueOf();
        return undefined;
    }

    function numberOfDaysBetweenSelectedDateRange(startDate, endDate) {
        if (endDate == startDate) {
            return `1 ${labels.day}`;
        } else {
            const differenceInTime =
                new Date(endDate).getTime() - new Date(startDate).getTime();
            return (
                (differenceInTime / (1000 * 3600 * 24)).toString() + ` ${labels.days}`
            );
        }
    }

    const apply = () => {
        dispatch("onApplyDateRange", {
            startDate: dateFrom,
            endDate: dateTo,
            name: name,
        });
    };

    function setDateRange(peroid: string, now: Date = new Date()) {
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        if (peroid === "本月") {
            dateFrom = timeStampToRfc(
                new Date(currentYear, currentMonth, 1, 23, 59, 59)
            );
            dateTo = timeStampToRfc(new Date(currentYear, currentMonth + 1, 1));
        } else if (peroid === "本年") {
            dateFrom = timeStampToRfc(new Date(currentYear, 0, 1, 23, 59, 59));
            dateTo = timeStampToRfc(new Date(currentYear + 1, 0, 1));
        } else if (peroid === "上年") {
            dateFrom = timeStampToRfc(new Date(currentYear - 1, 0, 1, 23, 59, 59));
            dateTo = timeStampToRfc(new Date(currentYear, 0, 1));
        } else if (peroid === "上月") {
            dateFrom = timeStampToRfc(
                currentMonth === 0
                    ? new Date(currentYear - 1, 11, 1, 23, 59, 59)
                    : new Date(currentYear, currentMonth - 1, 1, 23, 59, 59)
            );
            dateTo = timeStampToRfc(
                currentMonth === 0
                    ? new Date(currentYear - 1, 11, 31, 23, 59, 59)
                    : new Date(currentYear, currentMonth, 1)
            );
        }
        dateOrSliderChange("startDate");
        dateOrSliderChange("endDate");
    }
</script>

<div style="border:1px solid rgba(80, 80, 80, 0.2);padding-top:8px;padding-bottom:8px;width:333px">
    <div style="padding:0;margin:10px">
        {heading}
        <button class="ml-3" on:click={() => setDateRange("本月")}>本月</button>
        <button class="ml-1" on:click={() => setDateRange("本年")}>本年</button>
        <button class="ml-1" on:click={() => setDateRange("上年")}>上年</button>
        <button class="ml-1" on:click={() => setDateRange("上月")}>上月</button>
    </div>
    <div style="padding:0;margin:0">
        <input
                style="width:auto;padding:2px;margin:0;margin-left:10px"
                type="date"
                min={startDateMinRfc}
                max={endDateMaxRfc}
                bind:value={dateFrom}
                on:input={() => {
        dateOrSliderChange("startDate");
      }}
        />~
        <input
                style="width:auto;padding:2px;margin:0"
                type="date"
                min={startDateMinRfc}
                max={endDateMaxRfc}
                bind:value={dateTo}
                on:input={() => {
        dateOrSliderChange("endDate");
      }}
        />
    </div>
    <div style="padding:0;margin:0">
        <input
                style="margin-left:10px"
                type="range"
                bind:value={sliderStartTimestamp}
                min={startDateMinTimestamp}
                max={endDateMaxTimestamp}
                step="86400000"
                title={new Date(dateFrom).toString()}
                on:input={() => {
        dateOrSliderChange("sliderStartTimestamp");
      }}
        />
        <input
                style="margin-left:20px"
                type="range"
                bind:value={sliderEndTimestamp}
                min={startDateMinTimestamp}
                max={endDateMaxTimestamp}
                step="86400000"
                title={new Date(dateTo).toString()}
                on:input={() => {
        dateOrSliderChange("sliderEndTimestamp");
      }}
        />
    </div>
</div>
