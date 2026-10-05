let processes = [
    {
        pid: 101,
        name: "Process_A",
        priority: 2,
        arrivalTime: 0,
        burstTime: 10,
        remainingTime: 10,
        state: "RUNNING"
    },
    {
        pid: 102,
        name: "Process_B",
        priority: 1,
        arrivalTime: 2,
        burstTime: 6,
        remainingTime: 6,
        state: "READY"
    },
    {
        pid: 103,
        name: "Process_C",
        priority: 4,
        arrivalTime: 3,
        burstTime: 8,
        remainingTime: 8,
        state: "SUSPENDED"
    },
    {
        pid: 104,
        name: "Process_D",
        priority: 3,
        arrivalTime: 5,
        burstTime: 4,
        remainingTime: 0,
        state: "TERMINATED"
    }
];

let nextPID = 105;


/* =========================
   INITIALIZATION
========================= */

document.addEventListener("DOMContentLoaded", () => {

    updateDashboard();

    renderProcesses();

    setupNavigation();

    setupCreateProcess();

    setupStateFilter();

    setupScheduler();

    updateClock();

    setInterval(updateClock, 1000);
});


/* =========================
   CLOCK
========================= */

function updateClock() {

    const now = new Date();

    const time = now.toLocaleTimeString();

    document.getElementById("system-time").textContent = time;
}


/* =========================
   NAVIGATION
========================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            navItems.forEach(nav => {
                nav.classList.remove("active");
            });

            item.classList.add("active");

            const section =
                item.dataset.section;

            showSection(section);

        });

    });
}


function showSection(section) {

    document
        .querySelectorAll(".page-section")
        .forEach(element => {
            element.classList.remove("active");
        });


    const selectedSection =
        document.getElementById(
            `${section}-section`
        );

    if (selectedSection) {
        selectedSection.classList.add("active");
    }


    const titles = {
        dashboard: "Process Dashboard",
        processes: "Process Management",
        scheduler: "CPU Scheduler",
        pcb: "Process Control Block"
    };

    document.getElementById("page-title")
        .textContent =
        titles[section] || "Process Dashboard";
}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {

    const total =
        processes.length;

    const ready =
        processes.filter(
            p => p.state === "READY"
        ).length;

    const running =
        processes.filter(
            p => p.state === "RUNNING"
        ).length;

    const suspended =
        processes.filter(
            p => p.state === "SUSPENDED"
        ).length;

    const terminated =
        processes.filter(
            p => p.state === "TERMINATED"
        ).length;


    document.getElementById(
        "total-processes"
    ).textContent = total;

    document.getElementById(
        "ready-processes"
    ).textContent = ready;

    document.getElementById(
        "running-processes"
    ).textContent = running;

    document.getElementById(
        "suspended-processes"
    ).textContent = suspended;

    document.getElementById(
        "terminated-processes"
    ).textContent = terminated;
}


/* =========================
   PROCESS TABLE
========================= */

function renderProcesses() {

    const tableBody =
        document.getElementById(
            "process-table-body"
        );

    const emptyState =
        document.getElementById(
            "empty-state"
        );

    const filter =
        document.getElementById(
            "state-filter"
        ).value;


    let filteredProcesses =
        processes;


    if (filter !== "ALL") {

        filteredProcesses =
            processes.filter(
                process =>
                    process.state === filter
            );
    }


    tableBody.innerHTML = "";


    if (filteredProcesses.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    filteredProcesses.forEach(process => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <span class="pid">
                    ${process.pid}
                </span>
            </td>

            <td>
                <span class="process-name">
                    ${process.name}
                </span>
            </td>

            <td>
                ${process.priority}
            </td>

            <td>
                ${process.burstTime}
            </td>

            <td>
                ${process.remainingTime}
            </td>

            <td>

                <span
                    class="state-badge state-${process.state}"
                >
                    ${process.state}
                </span>

            </td>

            <td>

                <div class="action-buttons">

                    ${getActionButtons(process)}

                    <button
                        class="action-button"
                        onclick="viewPCB(${process.pid})"
                    >
                        PCB
                    </button>

                </div>

            </td>
        `;


        tableBody.appendChild(row);

    });
}


/* =========================
   ACTION BUTTONS
========================= */

function getActionButtons(process) {

    if (process.state === "NEW") {

        return `
            <button
                class="action-button"
                onclick="executeProcess(${process.pid})"
            >
                Execute
            </button>

            <button
                class="action-button danger"
                onclick="terminateProcess(${process.pid})"
            >
                Terminate
            </button>
        `;
    }


    if (process.state === "READY") {

        return `
            <button
                class="action-button"
                onclick="executeProcess(${process.pid})"
            >
                Execute
            </button>

            <button
                class="action-button danger"
                onclick="terminateProcess(${process.pid})"
            >
                Terminate
            </button>
        `;
    }


    if (process.state === "RUNNING") {

        return `
            <button
                class="action-button"
                onclick="suspendProcess(${process.pid})"
            >
                Suspend
            </button>

            <button
                class="action-button danger"
                onclick="terminateProcess(${process.pid})"
            >
                Terminate
            </button>
        `;
    }


    if (process.state === "SUSPENDED") {

        return `
            <button
                class="action-button"
                onclick="resumeProcess(${process.pid})"
            >
                Resume
            </button>

            <button
                class="action-button danger"
                onclick="terminateProcess(${process.pid})"
            >
                Terminate
            </button>
        `;
    }


    return `
        <span style="color:#94a3b8">
            Completed
        </span>
    `;
}


/* =========================
   CREATE PROCESS
========================= */

function setupCreateProcess() {

    const form =
        document.getElementById(
            "create-process-form"
        );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                document.getElementById(
                    "process-name"
                ).value.trim();


            const priority =
                Number(
                    document.getElementById(
                        "priority"
                    ).value
                );


            const burstTime =
                Number(
                    document.getElementById(
                        "burst-time"
                    ).value
                );


            const arrivalTime =
                Number(
                    document.getElementById(
                        "arrival-time"
                    ).value
                );


            if (!name) {

                showToast(
                    "Please enter a process name."
                );

                return;
            }


            const process = {

                pid: nextPID++,

                name,

                priority,

                arrivalTime,

                burstTime,

                remainingTime: burstTime,

                state: "NEW"
            };


            processes.push(process);


            updateDashboard();

            renderProcesses();


            form.reset();


            document.getElementById(
                "priority"
            ).value = 5;


            document.getElementById(
                "burst-time"
            ).value = 10;


            document.getElementById(
                "arrival-time"
            ).value = 0;


            showToast(
                `Process ${process.pid} created successfully.`
            );

        }
    );
}


/* =========================
   PROCESS ACTIONS
========================= */

function executeProcess(pid) {

    const process =
        findProcess(pid);


    if (!process) return;


    if (
        process.state !== "READY" &&
        process.state !== "NEW"
    ) {

        showToast(
            "This process cannot be executed from its current state."
        );

        return;
    }


    const runningProcess =
        processes.find(
            p => p.state === "RUNNING"
        );


    if (runningProcess) {

        showToast(
            `PID ${runningProcess.pid} is already running.`
        );

        return;
    }


    process.state = "RUNNING";


    updateDashboard();

    renderProcesses();


    showToast(
        `PID ${pid} is now RUNNING.`
    );
}


function suspendProcess(pid) {

    const process =
        findProcess(pid);


    if (!process) return;


    if (process.state !== "RUNNING") {

        showToast(
            "Only a running process can be suspended."
        );

        return;
    }


    process.state = "SUSPENDED";


    updateDashboard();

    renderProcesses();


    showToast(
        `PID ${pid} has been suspended.`
    );
}


function resumeProcess(pid) {

    const process =
        findProcess(pid);


    if (!process) return;


    if (process.state !== "SUSPENDED") {

        showToast(
            "Only a suspended process can be resumed."
        );

        return;
    }


    process.state = "READY";


    updateDashboard();

    renderProcesses();


    showToast(
        `PID ${pid} moved to READY.`
    );
}


function terminateProcess(pid) {

    const process =
        findProcess(pid);


    if (!process) return;


    if (process.state === "TERMINATED") {

        showToast(
            "Process is already terminated."
        );

        return;
    }


    process.state = "TERMINATED";

    process.remainingTime = 0;


    updateDashboard();

    renderProcesses();


    showToast(
        `PID ${pid} has been terminated.`
    );
}


/* =========================
   FIND PROCESS
========================= */

function findProcess(pid) {

    return processes.find(
        process =>
            process.pid === pid
    );
}


/* =========================
   PCB
========================= */

function viewPCB(pid) {

    const process =
        findProcess(pid);


    if (!process) return;


    const container =
        document.getElementById(
            "pcb-container"
        );


    container.innerHTML = `

        <div class="pcb-card">

            <div class="pcb-header">

                <h3>
                    Process Control Block
                </h3>

                <span>
                    PID ${process.pid}
                </span>

            </div>


            <div class="pcb-body">

                ${pcbRow(
                    "Process ID",
                    process.pid
                )}

                ${pcbRow(
                    "Process Name",
                    process.name
                )}

                ${pcbRow(
                    "State",
                    process.state
                )}

                ${pcbRow(
                    "Priority",
                    process.priority
                )}

                ${pcbRow(
                    "Arrival Time",
                    process.arrivalTime
                )}

                ${pcbRow(
                    "Burst Time",
                    process.burstTime
                )}

                ${pcbRow(
                    "Remaining Time",
                    process.remainingTime
                )}

            </div>

        </div>
    `;


    showSection("pcb");
}


function pcbRow(label, value) {

    return `

        <div class="pcb-row">

            <span>
                ${label}
            </span>

            <strong>
                ${value}
            </strong>

        </div>
    `;
}


/* =========================
   FILTER
========================= */

function setupStateFilter() {

    document
        .getElementById("state-filter")
        .addEventListener(
            "change",
            renderProcesses
        );
}


/* =========================
   SCHEDULER
========================= */

function setupScheduler() {

    const algorithm =
        document.getElementById(
            "scheduler-algorithm"
        );


    const quantumGroup =
        document.getElementById(
            "quantum-group"
        );


    algorithm.addEventListener(
        "change",
        () => {

            if (
                algorithm.value ===
                "ROUND_ROBIN"
            ) {

                quantumGroup.classList.remove(
                    "hidden"
                );

            } else {

                quantumGroup.classList.add(
                    "hidden"
                );
            }
        }
    );


    document
        .getElementById("run-scheduler")
        .addEventListener(
            "click",
            runScheduler
        );
}


function runScheduler() {

    const algorithm =
        document.getElementById(
            "scheduler-algorithm"
        ).value;


    const activeProcesses =
        processes.filter(
            p =>
                p.state !== "TERMINATED"
        );


    if (activeProcesses.length === 0) {

        showToast(
            "No active processes available."
        );

        return;
    }


    let orderedProcesses = [
        ...activeProcesses
    ];


    if (algorithm === "FCFS") {

        orderedProcesses.sort(
            (a, b) =>
                a.arrivalTime -
                b.arrivalTime
        );
    }


    else if (algorithm === "SJF") {

        orderedProcesses.sort(
            (a, b) =>
                a.burstTime -
                b.burstTime
        );
    }


    else if (algorithm === "PRIORITY") {

        orderedProcesses.sort(
            (a, b) =>
                a.priority -
                b.priority
        );
    }


    else if (
        algorithm === "ROUND_ROBIN"
    ) {

        orderedProcesses =
            roundRobinOrder(
                activeProcesses
            );
    }


    renderGanttChart(
        orderedProcesses
    );


    showToast(
        `${algorithm} scheduling completed.`
    );
}


function roundRobinOrder(list) {

    const result = [];

    const quantum =
        Number(
            document.getElementById(
                "time-quantum"
            ).value
        );


    list.forEach(process => {

        const cycles =
            Math.max(
                1,
                Math.ceil(
                    process.burstTime /
                    quantum
                )
            );


        for (
            let i = 0;
            i < cycles;
            i++
        ) {

            result.push({
                ...process,

                burstTime:
                    Math.min(
                        quantum,
                        process.burstTime -
                        i * quantum
                    )
            });

        }

    });


    return result;
}


/* =========================
   GANTT CHART
========================= */

function renderGanttChart(processList) {

    const chart =
        document.getElementById(
            "gantt-chart"
        );


    if (!processList.length) {

        chart.innerHTML = `
            <div class="gantt-placeholder">
                No processes available.
            </div>
        `;

        return;
    }


    const totalBurst =
        processList.reduce(
            (sum, process) =>
                sum + process.burstTime,
            0
        );


    let html = `
        <div class="gantt-row">

            <div class="gantt-blocks">
    `;


    processList.forEach(process => {

        const width =
            (
                process.burstTime /
                totalBurst
            ) * 100;


        html += `

            <div
                class="gantt-block"
                style="width:${width}%"
            >
                P${process.pid}
            </div>
        `;
    });


    html += `
            </div>

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    margin-top:8px;
                    font-size:9px;
                    color:#64748b;
                "
            >
                <span>0</span>
                <span>${totalBurst}</span>
            </div>

        </div>
    `;


    chart.innerHTML = html;
}


/* =========================
   TOAST
========================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    const messageElement =
        document.getElementById(
            "toast-message"
        );


    messageElement.textContent =
        message;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2500);
}