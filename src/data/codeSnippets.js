const snippets = {
  javascript: [
    `function fibonacci(n) { if (n <= 1) return n; return fibonacci(n - 1) + fibonacci(n - 2); }`,
    `const sum = arr.reduce((acc, val) => acc + val, 0);`,
    `async function fetchData(url) { const res = await fetch(url); return res.json(); }`,
    `const unique = [...new Set(array)];`,
    `document.addEventListener('click', (e) => { console.log(e.target); });`,
    `const debounce = (fn, ms) => { let id; return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); }; };`,
    `const map = new Map(); map.set('key', 'value'); console.log(map.get('key'));`,
    `try { const data = JSON.parse(input); } catch (err) { console.error(err.message); }`,
    `export default function App() { return <div className="app">Hello</div>; }`,
    `const [state, setState] = useState(0); useEffect(() => { setState(1); }, []);`,
  ],
  python: [
    `def fibonacci(n): return n if n <= 1 else fibonacci(n - 1) + fibonacci(n - 2)`,
    `result = [x ** 2 for x in range(10) if x % 2 == 0]`,
    `with open('file.txt', 'r') as f: content = f.read()`,
    `from collections import Counter; counts = Counter(words)`,
    `class Animal: def __init__(self, name): self.name = name`,
    `import requests; response = requests.get(url); data = response.json()`,
    `try: value = int(input("Enter: ")) except ValueError: print("Invalid")`,
    `def decorator(func): def wrapper(*args): return func(*args); return wrapper`,
    `lambda x, y: x + y`,
    `dict_comp = {k: v for k, v in zip(keys, values)}`,
  ],
  typescript: [
    `interface User { id: number; name: string; email: string; }`,
    `const greet = (name: string): string => { return "Hello " + name; };`,
    `type Result<T> = { data: T; error: null } | { data: null; error: string };`,
    `enum Direction { Up = "UP", Down = "DOWN", Left = "LEFT", Right = "RIGHT" }`,
    `const parse = <T>(json: string): T => JSON.parse(json) as T;`,
    `async function getData(): Promise<User[]> { return fetch(url).then(r => r.json()); }`,
    `const isString = (val: unknown): val is string => typeof val === "string";`,
    `class Stack<T> { private items: T[] = []; push(item: T) { this.items.push(item); } }`,
  ],
  go: [
    `func main() { fmt.Println("Hello, World!") }`,
    `for i := 0; i < 10; i++ { fmt.Println(i) }`,
    `func add(a, b int) int { return a + b }`,
    `if err != nil { log.Fatal(err) }`,
    `ch := make(chan int); go func() { ch <- 42 }()`,
    `type User struct { Name string; Age int }`,
    `slice := []int{1, 2, 3}; slice = append(slice, 4)`,
    `defer file.Close()`,
    `func (u *User) String() string { return u.Name }`,
    `select { case msg := <-ch: fmt.Println(msg) case <-time.After(time.Second): fmt.Println("timeout") }`,
  ],
  rust: [
    `fn main() { println!("Hello, world!"); }`,
    `let mut v: Vec<i32> = Vec::new(); v.push(1);`,
    `match value { Some(x) => println!("{}", x), None => println!("nothing"), }`,
    `fn add(a: i32, b: i32) -> i32 { a + b }`,
    `let s = String::from("hello"); let len = s.len();`,
    `struct Point { x: f64, y: f64 }`,
    `impl Point { fn new(x: f64, y: f64) -> Self { Point { x, y } } }`,
    `for i in 0..10 { println!("{}", i); }`,
    `let result: Result<i32, String> = Ok(42);`,
    `use std::collections::HashMap; let mut map = HashMap::new();`,
  ],
}

export const codeLanguages = Object.keys(snippets)

export function getCodeSnippet(language = 'javascript') {
  const pool = snippets[language] || snippets.javascript
  return pool[Math.floor(Math.random() * pool.length)].split(/\s+/)
}
