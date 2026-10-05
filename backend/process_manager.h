#ifndef PROCESS_MANAGER_H
#define PROCESS_MANAGER_H

#include "pcb.h"

typedef struct {
    PCB processes[MAX_PROCESSES];

    int process_count;

    int next_pid;

} ProcessManager;


void initialize_process_manager(
    ProcessManager *manager
);


int create_process(
    ProcessManager *manager,
    const char *name,
    int priority,
    int arrival_time,
    int burst_time
);


int execute_process(
    ProcessManager *manager,
    int pid
);


int suspend_process(
    ProcessManager *manager,
    int pid
);


int resume_process(
    ProcessManager *manager,
    int pid
);


int terminate_process(
    ProcessManager *manager,
    int pid
);


PCB *find_process(
    ProcessManager *manager,
    int pid
);


void display_all_processes(
    ProcessManager *manager
);


#endif