function Article(props) {
  return (
    <div className="article">
      <h2>{props.title}</h2>
      <p>{props.content}</p>
    </div>
  );
}

function Sidebar(props) {
  return (
    <div className="sidebar">
      <h3>{props.title}</h3>
      {props.children}
    </div>
  );
}

function Blog() {
  return (
    <div>
      <div id="header">
        <h1>My Blog</h1>
      </div>
      <div id="content">
        <div id="left-column">
          <Article title="My First Article" content="This is my first blog article." />
          <Article title="My Second Article" content="This is my second blog article." />
          <Article title="My Third Article" content="This is my third blog article." />
        </div>
        <div id="right-column">
          <Sidebar title="About Me">
            <p>My name is John Doe and I am a blogger.</p>
          </Sidebar>
          <Sidebar title="Categories">
            <ul>
              <li>Category 1</li>
              <li>Category 2</li>
              <li>Category 3</li>
            </ul>
          </Sidebar>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<Blog />, document.getElementById('root'));
