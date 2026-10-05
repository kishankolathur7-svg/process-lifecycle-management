#ifndef PCB_H
#define PCB_H

#define MAX_PROCESSES 100
#define PROCESS_NAME_SIZE 50

typedef enum {
    NEW,
    READY,
    RUNNING,
    SUSPENDED,
    TERMINATED
} ProcessState;

typedef struct {
    int pid;
    char name[PROCESS_NAME_SIZE];

    ProcessState state;

    int priority;
    int arrival_time;
    int burst_time;
    int remaining_time;

    int cpu_time;
} PCB;

const char *get_state_name(ProcessState state);

void initialize_pcb(
    PCB *process,
    int pid,
    const char *name,
    int priority,
    int arrival_time,
    int burst_time
);

void display_pcb(const PCB *process);

#endif