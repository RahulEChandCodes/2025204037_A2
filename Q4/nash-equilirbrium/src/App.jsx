import { Typography, Card, Table, Divider, Space, Tag, Row, Col } from "antd";
import Nash from "./Nash";

const { Title, Paragraph, Text } = Typography;

function App() {
  // Payoff matrix data for the table
  const payoffData = [
    {
      key: "1",
      player1Action: "Go",
      goPayoff: "-10, -10",
      stopPayoff: "4*, -1*",
    },
    {
      key: "2",
      player1Action: "Stop",
      goPayoff: "-1*, 4*",
      stopPayoff: "-3, -3",
    },
  ];

  const columns = [
    {
      title: "",
      dataIndex: "player1Action",
      key: "player1Action",
      width: 100,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Go",
      dataIndex: "goPayoff",
      key: "goPayoff",
      align: "center",
      render: (text) => {
        const isNashEquilibrium = text.includes("*");
        return (
          <Text style={{ color: isNashEquilibrium ? "#52c41a" : "inherit" }}>
            {text}
          </Text>
        );
      },
    },
    {
      title: "Stop",
      dataIndex: "stopPayoff",
      key: "stopPayoff",
      align: "center",
      render: (text) => {
        const isNashEquilibrium = text.includes("*");
        return (
          <Text style={{ color: isNashEquilibrium ? "#52c41a" : "inherit" }}>
            {text}
          </Text>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Nash />
      <Title level={1} style={{ textAlign: "center", marginBottom: "32px" }}>
        Nash Equilibrium at Traffic Signals
      </Title>

      <Card style={{ marginBottom: "24px" }}>
        <Title level={2}>The Scenario</Title>
        <Paragraph>
          Imagine the scenario of two cars coming along different roads towards
          an intersection. As they approach the point where the two roads meet,
          they notice each other. Each one now has two choices: to either{" "}
          <Text strong>'Go'</Text> (i.e. continue driving) or{" "}
          <Text strong>'Stop'</Text> (i.e. hit the brakes).
        </Paragraph>
        <Paragraph>
          Let's draw the corresponding pay-off matrix (Calling the cars Player1
          and Player2):
        </Paragraph>
      </Card>

      <Card style={{ marginBottom: "24px" }}>
        <Title level={3}>Payoff Matrix</Title>
        <Row justify="center" style={{ marginBottom: "16px" }}>
          <Col>
            <Text>Player 2 Actions</Text>
          </Col>
        </Row>
        <Table
          dataSource={payoffData}
          columns={columns}
          pagination={false}
          bordered
          size="middle"
          style={{ marginBottom: "16px" }}
        />
        <Space direction="vertical" size="small">
          <Text type="secondary">
            <Text strong>Note:</Text> Player1 corresponds to the rows, Player2
            corresponds to the columns.
          </Text>
          <Text type="secondary">
            For each tuple, the first number is Player1's payoff, the second is
            Player2's payoff.
          </Text>
          <Text style={{ color: "#52c41a" }}>
            <Text strong>*</Text> indicates best response strategies (Nash
            Equilibrium cells)
          </Text>
        </Space>
      </Card>

      <Card style={{ marginBottom: "24px" }}>
        <Title level={3}>Payoff Analysis</Title>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Card size="small" style={{ backgroundColor: "#fff2f0" }}>
            <Title level={5}>Both Go (-10, -10)</Title>
            <Paragraph>
              If both players Go, it will cause an accident - hence the high
              negative payoffs for both.
            </Paragraph>
          </Card>

          <Card size="small" style={{ backgroundColor: "#f6ffed" }}>
            <Title level={5}>One Goes, One Stops (4, -1) or (-1, 4)</Title>
            <Paragraph>
              The stopping player gets a small negative payoff (-1), while the
              one who continues driving gets the best possible payoff (4).
            </Paragraph>
          </Card>

          <Card size="small" style={{ backgroundColor: "#fffbe6" }}>
            <Title level={5}>Both Stop (-3, -3)</Title>
            <Paragraph>
              If both Stop, it causes an infinite wait - yielding negative
              payoffs for both (though not as negative as an accident, since
              being bored waiting is better than being dead).
            </Paragraph>
          </Card>
        </Space>
      </Card>

      <Card style={{ marginBottom: "24px" }}>
        <Title level={3}>Best Response Analysis</Title>
        <Paragraph>Consider Player1:</Paragraph>
        <ul>
          <li>
            <Text>
              If Player2 decides to <Text strong>Go</Text>, Player1's better
              payoff comes from doing <Text strong>Stop</Text> (-1 &gt; -10)
            </Text>
          </li>
          <li>
            <Text>
              If Player2 decides to <Text strong>Stop</Text>, Player1 should{" "}
              <Text strong>Go</Text> (4 &gt; -3)
            </Text>
          </li>
        </ul>
        <Paragraph>
          Since this is a symmetrical scenario, the same applies the other way
          round too.
        </Paragraph>
      </Card>

      <Card style={{ marginBottom: "24px" }}>
        <Title level={3}>Nash Equilibrium</Title>
        <Paragraph>
          <Text strong>Definition:</Text> A Nash equilibrium is a scenario where
          NO player benefits from changing their strategy, given the strategies
          of all the others.
        </Paragraph>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              size="small"
              style={{ backgroundColor: "#f6ffed", height: "100%" }}
            >
              <Title level={5}>
                <Tag color="green">Nash Equilibrium 1</Tag>
                (Stop, Go)
              </Title>
              <Paragraph>
                Player1 stops, Player2 continues. Neither player would benefit
                from changing their strategy unilaterally.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              size="small"
              style={{ backgroundColor: "#f6ffed", height: "100%" }}
            >
              <Title level={5}>
                <Tag color="green">Nash Equilibrium 2</Tag>
                (Go, Stop)
              </Title>
              <Paragraph>
                Player1 continues, Player2 stops. Again, neither player would
                benefit from changing their strategy unilaterally.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: "24px" }}>
        <Title level={3}>The Problem</Title>
        <Paragraph>
          We have two different Nash Equilibria, but each player prefers a
          different one:
        </Paragraph>
        <ul>
          <li>
            <Text>
              Player1 prefers <Text strong>(Go, Stop)</Text> - where they get to
              continue and the other stops
            </Text>
          </li>
          <li>
            <Text>
              Player2 prefers <Text strong>(Stop, Go)</Text> - where they get to
              continue and the other stops
            </Text>
          </li>
        </ul>
        <Paragraph>
          <Text type="danger">
            If both decide to do what they prefer, it results in an accident!
          </Text>
        </Paragraph>
      </Card>

      <Card>
        <Title level={3}>The Solution: Traffic Lights</Title>
        <Paragraph>
          Traffic lights solve this coordination problem by:
        </Paragraph>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Card size="small" style={{ backgroundColor: "#e6f7ff" }}>
            <Title level={5}>Random/Fair Selection</Title>
            <Paragraph>
              Based on the time when cars arrive at the intersection, traffic
              lights randomly (or fairly) tell one player to stop while the
              other to go.
            </Paragraph>
          </Card>

          <Card size="small" style={{ backgroundColor: "#e6f7ff" }}>
            <Title level={5}>Forcing Nash Equilibrium</Title>
            <Paragraph>
              This forces the game into one of its Nash equilibria, ensuring no
              accidents occur.
            </Paragraph>
          </Card>

          <Card size="small" style={{ backgroundColor: "#e6f7ff" }}>
            <Title level={5}>No Incentive to Deviate</Title>
            <Paragraph>
              Because the selection is random/fair, no driver has any incentive
              to deviate from what the traffic lights tell them to do.
            </Paragraph>
          </Card>
        </Space>

        <Divider />

        <Paragraph type="secondary" style={{ fontStyle: "italic" }}>
          <Text strong>Note:</Text> Like all Game Theory simulations, this is a
          simplified version of what really happens in traffic scenarios.
        </Paragraph>
      </Card>
    </div>
  );
}

export default App;
