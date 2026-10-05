#include <stdio.h>

#include "process_manager.h"


int main(void)
{
    ProcessManager manager;


    initialize_process_manager(
        &manager
    );


    printf("\n");
    printf("============================================\n");
    printf("   PROCESS LIFECYCLE MANAGEMENT SYSTEM\n");
    printf("============================================\n");


    /*
     * CREATE PROCESSES
     */

    int pid1 =
        create_process(
            &manager,
            "Process_A",
            2,
            0,
            10
        );


    int pid2 =
        create_process(
            &manager,
            "Process_B",
            1,
            1,
            5
        );


    int pid3 =
        create_process(
            &manager,
            "Process_C",
            3,
            2,
            8
        );


    printf(
        "\nCreated processes: %d, %d, %d\n",
        pid1,
        pid2,
        pid3
    );


    display_all_processes(
        &manager
    );


    /*
     * EXECUTE PROCESS
     */

    printf(
        "\nExecuting PID %d...\n",
        pid1
    );


    execute_process(
        &manager,
        pid1
    );


    display_all_processes(
        &manager
    );


    /*
     * SUSPEND PROCESS
     */

    printf(
        "\nSuspending PID %d...\n",
        pid1
    );


    suspend_process(
        &manager,
        pid1
    );


    display_all_processes(
        &manager
    );


    /*
     * RESUME PROCESS
     */

    printf(
        "\nResuming PID %d...\n",
        pid1
    );


    resume_process(
        &manager,
        pid1
    );


    display_all_processes(
        &manager
    );


    /*
     * TERMINATE PROCESS
     */

    printf(
        "\nTerminating PID %d...\n",
        pid1
    );


    terminate_process(
        &manager,
        pid1
    );


    display_all_processes(
        &manager
    );


    return 0;
}