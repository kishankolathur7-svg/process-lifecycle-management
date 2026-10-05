#include <stdio.h>
#include <string.h>

#include "pcb.h"

const char *get_state_name(ProcessState state)
{
    switch (state)
    {
        case NEW:
            return "NEW";

        case READY:
            return "READY";

        case RUNNING:
            return "RUNNING";

        case SUSPENDED:
            return "SUSPENDED";

        case TERMINATED:
            return "TERMINATED";

        default:
            return "UNKNOWN";
    }
}


void initialize_pcb(
    PCB *process,
    int pid,
    const char *name,
    int priority,
    int arrival_time,
    int burst_time
)
{
    process->pid = pid;

    strncpy(
        process->name,
        name,
        PROCESS_NAME_SIZE - 1
    );

    process->name[
        PROCESS_NAME_SIZE - 1
    ] = '\0';

    process->state = NEW;

    process->priority = priority;

    process->arrival_time =
        arrival_time;

    process->burst_time =
        burst_time;

    process->remaining_time =
        burst_time;

    process->cpu_time = 0;
}


void display_pcb(const PCB *process)
{
    printf("\n");
    printf("========================================\n");
    printf("        PROCESS CONTROL BLOCK\n");
    printf("========================================\n");

    printf("PID              : %d\n",
           process->pid);

    printf("Process Name     : %s\n",
           process->name);

    printf("State            : %s\n",
           get_state_name(process->state));

    printf("Priority         : %d\n",
           process->priority);

    printf("Arrival Time     : %d\n",
           process->arrival_time);

    printf("Burst Time       : %d\n",
           process->burst_time);

    printf("Remaining Time   : %d\n",
           process->remaining_time);

    printf("CPU Time         : %d\n",
           process->cpu_time);

    printf("========================================\n");
}