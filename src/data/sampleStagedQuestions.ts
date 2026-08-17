export interface StagedTestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface StagedQuestion {
  id: string;
  title: string;
  description: string;
  source: 'Student_Interview' | 'LeetCode' | 'Codeforces' | 'CSES';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  suggestedCategory: string;
  confirmedCategory?: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  similarityScore: number;
  isDuplicate: boolean;
  timeLimitSeconds: number;
  memoryLimitMb: number;
  referenceSolution: {
    language: string;
    code: string;
  };
  testCases: StagedTestCase[];
  testPassRate: string; // e.g. "10/10 Passed"
  sandboxStatus: 'VERIFIED' | 'FLAKY' | 'PENDING';
  submittedAt: string;
}

export const SAMPLE_STAGED_QUESTIONS: StagedQuestion[] = [
  {
    id: 'stg-001',
    title: 'Shortest Path in Binary Matrix (Multi-Source BFS)',
    description: 'Given an n x n binary grid, return the length of the shortest clear path in the matrix from top-left (0,0) to bottom-right (n-1, n-1). If no such path exists, return -1. A clear path is a path of 8-directionally adjacent cells where all visited cells are 0.',
    source: 'Student_Interview',
    difficulty: 'Medium',
    suggestedCategory: 'DSA/Graphs/Breadth First Search (BFS)',
    confirmedCategory: 'DSA/Graphs/Breadth First Search (BFS)',
    status: 'PENDING_REVIEW',
    similarityScore: 0.28,
    isDuplicate: false,
    timeLimitSeconds: 2.0,
    memoryLimitMb: 128,
    referenceSolution: {
      language: 'cpp',
      code: `#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\n\nint shortestPathBinaryMatrix(vector<vector<int>>& grid) {\n    int n = grid.size();\n    if (grid[0][0] != 0 || grid[n-1][n-1] != 0) return -1;\n    queue<pair<int, int>> q;\n    q.push({0, 0});\n    grid[0][0] = 1;\n    int dist = 1;\n    int dx[8] = {-1,-1,-1,0,0,1,1,1};\n    int dy[8] = {-1,0,1,-1,1,-1,0,1};\n    while (!q.empty()) {\n        int sz = q.size();\n        while (sz--) {\n            auto [r, c] = q.front(); q.pop();\n            if (r == n - 1 && c == n - 1) return dist;\n            for (int i = 0; i < 8; i++) {\n                int nr = r + dx[i], nc = c + dy[i];\n                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 0) {\n                    grid[nr][nc] = 1;\n                    q.push({nr, nc});\n                }\n            }\n        }\n        dist++;\n    }\n    return -1;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<vector<int>> grid(n, vector<int>(n));\n    for (int i = 0; i < n; i++)\n        for (int j = 0; j < n; j++)\n            cin >> grid[i][j];\n    cout << shortestPathBinaryMatrix(grid) << "\\n";\n    return 0;\n}`
    },
    testCases: [
      { id: 1, input: "3\n0 0 0\n1 1 0\n1 1 0", expectedOutput: "4", isSample: true },
      { id: 2, input: "2\n0 1\n1 0", expectedOutput: "2", isSample: true },
      { id: 3, input: "2\n1 0\n0 0", expectedOutput: "-1", isSample: false },
      { id: 4, input: "3\n0 1 0\n1 1 0\n1 1 0", expectedOutput: "-1", isSample: false },
      { id: 5, input: "1\n0", expectedOutput: "1", isSample: false },
      { id: 6, input: "1\n1", expectedOutput: "-1", isSample: false },
      { id: 7, input: "4\n0 0 0 0\n1 1 0 0\n0 0 0 1\n0 1 0 0", expectedOutput: "5", isSample: false },
      { id: 8, input: "3\n0 0 0\n0 0 0\n0 0 0", expectedOutput: "3", isSample: false },
      { id: 9, input: "3\n0 1 1\n1 1 1\n1 1 0", expectedOutput: "-1", isSample: false },
      { id: 10, input: "4\n0 1 1 0\n0 0 1 0\n1 0 0 0\n0 1 0 0", expectedOutput: "4", isSample: false }
    ],
    testPassRate: '10/10 Passed',
    sandboxStatus: 'VERIFIED',
    submittedAt: '2026-08-17 14:20'
  },
  {
    id: 'stg-002',
    title: 'Coin Change II (Unbounded Knapsack DP)',
    description: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the number of combinations that make up that amount. You may assume an infinite number of each kind of coin.',
    source: 'LeetCode',
    difficulty: 'Medium',
    suggestedCategory: 'DSA/Dynamic Programming/Knapsack',
    confirmedCategory: 'DSA/Dynamic Programming/Knapsack',
    status: 'PENDING_REVIEW',
    similarityScore: 0.15,
    isDuplicate: false,
    timeLimitSeconds: 2.0,
    memoryLimitMb: 128,
    referenceSolution: {
      language: 'python',
      code: `import sys\n\ndef change(amount, coins):\n    dp = [0] * (amount + 1)\n    dp[0] = 1\n    for coin in coins:\n        for x in range(coin, amount + 1):\n            dp[x] += dp[x - coin]\n    return dp[amount]\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    amount = int(lines[0])\n    n = int(lines[1])\n    coins = [int(x) for x in lines[2:2+n]]\n    print(change(amount, coins))\n\nif __name__ == '__main__':\n    main()`
    },
    testCases: [
      { id: 1, input: "5 3\n1 2 5", expectedOutput: "4", isSample: true },
      { id: 2, input: "3 1\n2", expectedOutput: "0", isSample: true },
      { id: 3, input: "10 4\n10 5 2 1", expectedOutput: "11", isSample: false },
      { id: 4, input: "0 2\n1 2", expectedOutput: "1", isSample: false },
      { id: 5, input: "500 3\n1 2 5", expectedOutput: "6551", isSample: false },
      { id: 6, input: "100 1\n1", expectedOutput: "1", isSample: false },
      { id: 7, input: "7 2\n2 4", expectedOutput: "0", isSample: false },
      { id: 8, input: "15 3\n2 3 5", expectedOutput: "6", isSample: false },
      { id: 9, input: "20 4\n1 2 5 10", expectedOutput: "40", isSample: false },
      { id: 10, input: "1 1\n2", expectedOutput: "0", isSample: false }
    ],
    testPassRate: '10/10 Passed',
    sandboxStatus: 'VERIFIED',
    submittedAt: '2026-08-17 15:45'
  },
  {
    id: 'stg-003',
    title: 'Course Schedule (Topological Sort / Cycle Detection)',
    description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.',
    source: 'Student_Interview',
    difficulty: 'Medium',
    suggestedCategory: 'DSA/Graphs/Depth First Search (DFS)',
    confirmedCategory: 'DSA/Graphs/Depth First Search (DFS)',
    status: 'PENDING_REVIEW',
    similarityScore: 0.32,
    isDuplicate: false,
    timeLimitSeconds: 2.0,
    memoryLimitMb: 128,
    referenceSolution: {
      language: 'cpp',
      code: `#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\n\nbool canFinish(int numCourses, vector<pair<int, int>>& prerequisites) {\n    vector<vector<int>> adj(numCourses);\n    vector<int> indegree(numCourses, 0);\n    for (auto& p : prerequisites) {\n        adj[p.second].push_back(p.first);\n        indegree[p.first]++;\n    }\n    queue<int> q;\n    for (int i = 0; i < numCourses; i++) {\n        if (indegree[i] == 0) q.push(i);\n    }\n    int count = 0;\n    while (!q.empty()) {\n        int node = q.front(); q.pop();\n        count++;\n        for (int neighbor : adj[node]) {\n            if (--indegree[neighbor] == 0) q.push(neighbor);\n        }\n    }\n    return count == numCourses;\n}\n\nint main() {\n    int n, m;\n    if (!(cin >> n >> m)) return 0;\n    vector<pair<int, int>> prereqs(m);\n    for (int i = 0; i < m; i++) cin >> prereqs[i].first >> prereqs[i].second;\n    cout << (canFinish(n, prereqs) ? "true" : "false") << "\\n";\n    return 0;\n}`
    },
    testCases: [
      { id: 1, input: "2 1\n1 0", expectedOutput: "true", isSample: true },
      { id: 2, input: "2 2\n1 0\n0 1", expectedOutput: "false", isSample: true },
      { id: 3, input: "3 2\n1 0\n2 1", expectedOutput: "true", isSample: false },
      { id: 4, input: "3 3\n1 0\n2 1\n0 2", expectedOutput: "false", isSample: false },
      { id: 5, input: "1 0", expectedOutput: "true", isSample: false },
      { id: 6, input: "4 3\n1 0\n2 0\n3 1", expectedOutput: "true", isSample: false },
      { id: 7, input: "4 4\n1 0\n2 1\n3 2\n1 3", expectedOutput: "false", isSample: false },
      { id: 8, input: "5 4\n1 0\n2 1\n3 2\n4 3", expectedOutput: "true", isSample: false },
      { id: 9, input: "2 0", expectedOutput: "true", isSample: false },
      { id: 10, input: "4 2\n2 0\n3 1", expectedOutput: "true", isSample: false }
    ],
    testPassRate: '10/10 Passed',
    sandboxStatus: 'VERIFIED',
    submittedAt: '2026-08-17 16:10'
  }
];
