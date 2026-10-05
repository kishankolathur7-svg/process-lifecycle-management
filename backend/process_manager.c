#include <stdio.h>
#include <string.h>

#include "process_manager.h"


void initialize_process_manager(
    ProcessManager *manager
)
{
    manager->process_count = 0;

    manager->next_pid = 100;
}


PCB *find_process(
    ProcessManager *manager,
    int pid
)
{
    for (
        int i = 0;
        i < manager->process_count;
        i++
    )
    {
        if (
            manager->processes[i].pid
            == pid
        )
        {
            return &manager->processes[i];
        }
    }

    return NULL;
}


int create_process(
    ProcessManager *manager,
    const char *name,
    int priority,
    int arrival_time,
    int burst_time
)
{
    if (
        manager->process_count
        >= MAX_PROCESSES
    )
    {
        return -1;
    }


    int pid =
        manager->next_pid++;


    PCB *process =
        &manager->processes[
            manager->process_count
        ];


    initialize_pcb(
        process,
        pid,
        name,
        priority,
        arrival_time,
        burst_time
    );


    /*
     * NEW → READY
     *
     * The process has been successfully
     * created and is now waiting for CPU.
     */

    process->state = READY;


    manager->process_count++;


    return pid;
}


int execute_process(
    ProcessManager *manager,
    int pid
)
{
    PCB *process =
        find_process(
            manager,
            pid
        );


    if (process == NULL)
    {
        return -1;
    }


    if (
        process->state != READY
    )
    {
        return -2;
    }


    /*
     * READY → RUNNING
     */

    process->state =
        RUNNING;


    return 0;
}


int suspend_process(
    ProcessManager *manager,
    int pid
)
{
    PCB *process =
        find_process(
            manager,
            pid
        );


    if (process == NULL)
    {
        return -1;
    }


    if (
        process->state != RUNNING
    )
    {
        return -2;
    }


    /*
     * RUNNING → SUSPENDED
     */

    process->state =
        SUSPENDED;


    return 0;
}


int resume_process(
    ProcessManager *manager,
    int pid
)
{
    PCB *process =
        find_process(
            manager,
            pid
        );


    if (process == NULL)
    {
        return -1;
    }


    if (
        process->state != SUSPENDED
    )
    {
        return -2;
    }


    /*
     * SUSPENDED → READY
     */

    process->state =
        READY;


    return 0;
}


int terminate_process(
    ProcessManager *manager,
    int pid
)
{
    PCB *process =
        find_process(
            manager,
            pid
        );


    if (process == NULL)
    {
        return -1;
    }


    if (
        process->state
        == TERMINATED
    )
    {
        return -2;
    }


    /*
     * ACTIVE STATE → TERMINATED
     */

    process->state =
        TERMINATED;

    process->remaining_time =
        0;


    return 0;
}


void display_all_processes(
    ProcessManager *manager
)
{
    printf("\n");
    printf("==============================================================\n");
    printf("                     PROCESS TABLE\n");
    printf("==============================================================\n");

    printf(
        "%-6s %-18s %-12s %-10s %-10s\n",
        "PID",
        "NAME",
        "STATE",
        "PRIORITY",
        "REMAINING"
    );

    printf("--------------------------------------------------------------\n");


    for (
        int i = 0;
        i < manager->process_count;
        i++
    )
    {
        PCB *process =
            &manager->processes[i];


        printf(
            "%-6d %-18s %-12s %-10d %-10d\n",

            process->pid,

            process->name,

            get_state_name(
                process->state
            ),

            process->priority,

            process->remaining_time
        );
    }


    printf("==============================================================\n");
}