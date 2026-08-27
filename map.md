flowchart TD

    %% =========================================================================
    %% ROW 1 (TOP): INGESTION & CURATION ENGINE (Moves Left-to-Right ➡️)
    %% =========================================================================
    subgraph ROW1 ["ROW 1: Ingestion & Curation (Left-to-Right ➡️)"]
        direction LR

        subgraph L1 ["1. Ingestion Sources"]
            In_Student["<b>Student / Faculty Prompt</b><br/>• Raw interview question text<br/>• Audio transcription text"]
            In_Scraper["<b>Nightly Scraper Cron</b><br/>• LeetCode GraphQL API<br/>• Codeforces & CSES"]
            In_Payload["<b>Raw Input Schema</b><br/>- raw_text: string<br/>- source: Student / Scraper<br/>- timestamp: ISO_Date"]
            In_Student --> In_Payload
            In_Scraper --> In_Payload
        end

        subgraph M_A ["2. Curation & Deduplication Engine"]
            C1["<b>1. LLM Formalization</b><br/>• Formal Title & Description<br/>• Math constraints (1 <= N <= 10^5)"]
            C2["<b>2. 384-d Embedding</b><br/>• Vectorize with all-MiniLM"]
            C3["<b>3. Semantic Search</b><br/>• Cosine Similarity vs 5,000 DB"]
            C4{"<b>4. Similarity >= 0.85?</b>"}
            C_Dup["❌ Duplicate Found<br/>• Link DB ID & Halt"]
            C_Unique["✅ Unique Problem<br/>• Assign UUID"]
            
            C1 --> C2 --> C3 --> C4
            C4 -- Yes --> C_Dup
            C4 -- No --> C_Unique
        end

        L1 -->|Raw Text| C1
    end

    %% =========================================================================
    %% ROW 2 (MIDDLE): SYNTHESIS & SANDBOX EXECUTION (Moves Right-to-Left ⬅️)
    %% =========================================================================
    subgraph ROW2 ["ROW 2: Testcase Synthesizer & Docker Sandbox (Right-to-Left ⬅️)"]
        direction RL

        subgraph M_B ["3. Solution & Testcase Synthesizer"]
            S1["<b>5. Strategy Detection</b><br/>• Optimal pattern: DP / BFS / Greedy<br/>• Time O(N) & Space O(1)"]
            S2["<b>6. Code Generator</b><br/>• Multi-language: C++, Java, Python"]
            S3["<b>7. 10 Standard I/O Testcases</b><br/>• 3 Sample + 4 Edge + 3 Stress"]
            S4["<b>8. Stdin/Stdout Formatter</b><br/>• Raw strings with newlines"]
            S1 --> S2 --> S3 --> S4
        end

        subgraph M_C ["4. Isolated Execution Sandbox"]
            SB1["<b>9. Ephemeral Sandbox</b><br/>• 128MB RAM, 2.0s timeout<br/>• Network disabled"]
            SB2["<b>10. Compilation Runner</b><br/>• g++ / javac / python3"]
            SB3["<b>11. I/O Test Execution</b><br/>• Run stdin, capture stdout"]
            SB4{"<b>12. 10/10 Passed?</b>"}
            SB_Fail["❌ Flaky / Timeout<br/>• Log stderr"]
            SB_Pass["✅ 100% Pass Verified<br/>• Time < 2.0s"]
            SB1 --> SB2 --> SB3 --> SB4
            SB4 -- No --> SB_Fail
            SB4 -- Yes --> SB_Pass
        end

        M_B -->|Feed Code & Testcases| SB1
    end

    %% =========================================================================
    %% ROW 3 (BOTTOM): STAGING, CI/CD & PRODUCTION (Moves Left-to-Right ➡️)
    %% =========================================================================
    subgraph ROW3 ["ROW 3: Moodle XML, Staging, CI/CD & Live Students (Left-to-Right ➡️)"]
        direction LR

        subgraph M_D ["5. Taxonomy & Moodle XML"]
            M1["<b>13. Taxonomy Classifier</b><br/>• Category: $course$/top/DSA/Graphs/BFS<br/>• Auto-tag difficulty"]
            M2["<b>14. Moodle XML Builder</b><br/>• CDATA escaped HTML<br/>• Embed rubric & sample code"]
            M1 --> M2
        end

        subgraph L3 ["6. Staging & Review UI"]
            Staging_Table[("<b>StagedQuestion DB</b><br/>• 10 Verified Testcases<br/>• Status: PENDING")]
            Faculty_UI["<b>Faculty Curation UI</b><br/>• Checkbox batch selection<br/>• Diff & Testcase Inspector<br/>• 1-Click Approve to Live"]
            Staging_Table --> Faculty_UI
        end

        subgraph L4 ["7. CI/CD & Agile Tracker"]
            CI_1["<b>GitHub Actions CI</b><br/>• Lint & Typecheck (tsc)"]
            CI_2["<b>Playwright E2E Tests</b><br/>• Tests Login, UI & XML"]
            CI_3["<b>Agile Project Tracker</b><br/>• Milestone checkboxes<br/>• Tuesday Executive Countdown"]
            CI_1 --> CI_2 --> CI_3
        end

        subgraph L5 ["8. Live Production Server"]
            Prod_DB[("<b>Live Production DB</b><br/>• Dedicated College Server")]
            Moodle_XML["<b>Moodle XML Quiz File</b><br/>• Direct LMS Import"]
            Students["<b>5,000+ Placement Students</b><br/>• 100% verified questions<br/>• Zero broken test cases"]
            Prod_DB --> Students
            Moodle_XML --> Students
        end

        M2 --> Staging_Table
        Faculty_UI -->|Approve & Promote| Prod_DB
        Faculty_UI -->|Export XML| Moodle_XML
        CI_3 -.-> Faculty_UI
    end

    %% =========================================================================
    %% SNAKE TURNS BETWEEN ROWS
    %% =========================================================================
    C_Unique ==>|Turn Down ⬇️ to Row 2| S1
    SB_Pass ==>|Turn Down ⬇️ to Row 3| M1

    %% STYLING
    classDef r1 fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef r2 fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef r3 fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff;

    class L1,M_A r1;
    class M_B,M_C r2;
    class M_D,L3,L4,L5 r3;
